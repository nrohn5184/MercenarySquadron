import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  Text,
  Box,
  Grid,
  Badge,
  HStack,
  useToast
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { hirePilot } from '../store/squadronSlice';
import type { Pilot } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface PilotSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRank: 'Rookie' | 'Seasoned' | 'Elite';
}

const getLevelRangeForRank = (rank: 'Rookie' | 'Seasoned' | 'Elite'): [number, number] => {
  switch (rank) {
    case 'Rookie': return [1, 3];
    case 'Seasoned': return [4, 6];
    case 'Elite': return [7, 10];
  }
};

const generatePilotByLevel = (minLevel: number, maxLevel: number): Pilot => {
  const names = ['Alex', 'Sam', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Quinn'];
  const callSigns = ['Maverick', 'Ice', 'Viper', 'Ghost', 'Phoenix', 'Shadow', 'Storm', 'Wolf'];
  const sexOptions: ('M' | 'F' | 'Other')[] = ['M', 'F', 'Other'];
  
  // Helper function to generate random skill and experience based on level
  const generateSkillAndExp = (level: number, isAirCombat: boolean = false) => {
    const baseSkill = isAirCombat ? Math.max(50, 30 + (level * 5)) : 30 + (level * 5); // Higher level means better base skills
    const variation = 10; // Allow some random variation
    return {
      skill: Math.min(100, Math.floor(baseSkill + (Math.random() * variation * 2) - variation)),
      exp: Math.floor(Math.random() * 500) + (level * 200) // Higher level means more experience
    };
  };

  const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
  
  // Generate all skills and experience based on level
  const airToAir = generateSkillAndExp(level, true);
  const airToGround = generateSkillAndExp(level, true);
  const ecm = generateSkillAndExp(level);
  const eccm = generateSkillAndExp(level);
  const maneuver = generateSkillAndExp(level);
  const survival = generateSkillAndExp(level);
  
  let rank = 'Rookie';
  if (level >= 7) rank = 'Elite';
  else if (level >= 4) rank = 'Seasoned';

  // Generate combat record based on level and experience
  const baseKills = Math.floor(level * 1.5); // Base number of kills increases with level
  const killVariation = Math.floor(level * 0.5); // More variation for higher levels

  return {
    id: uuidv4(),
    name: names[Math.floor(Math.random() * names.length)],
    callSign: callSigns[Math.floor(Math.random() * callSigns.length)],
    rank,
    level,
    age: Math.floor(Math.random() * 20) + 20,
    sex: sexOptions[Math.floor(Math.random() * sexOptions.length)],
    skills: {
      airToAir: airToAir.skill,
      airToGround: airToGround.skill,
      ecm: ecm.skill,
      eccm: eccm.skill,
      maneuver: maneuver.skill,
      survival: survival.skill,
    },
    experience: {
      airToAir: airToAir.exp,
      airToGround: airToGround.exp,
      ecm: ecm.exp,
      eccm: eccm.exp,
      maneuver: maneuver.exp,
      survival: survival.exp,
    },
    combatRecord: {
      airToAirKills: Math.max(0, Math.floor(baseKills + (Math.random() * killVariation * 2) - killVariation)),
      groundTargetKills: Math.max(0, Math.floor(baseKills + (Math.random() * killVariation * 2) - killVariation))
    },
    status: 'available',
    morale: 75, // New hires start with good morale
    fatigue: 0,  // New hires start fully rested
  };
};

const calculatePilotCost = (level: number): number => {
  const baseCost = 1000;
  return baseCost + (level * 500); // Each level adds 500 credits to base cost
};

const PilotSelectionModal: React.FC<PilotSelectionModalProps> = ({ isOpen, onClose, selectedRank }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const credits = useSelector((state: RootState) => state.squadron.credits);

  // Generate three pilots of the selected rank
  const [minLevel, maxLevel] = getLevelRangeForRank(selectedRank);
  const availablePilots = [
    generatePilotByLevel(minLevel, maxLevel),
    generatePilotByLevel(minLevel, maxLevel),
    generatePilotByLevel(minLevel, maxLevel),
  ];

  const handleHirePilot = (pilot: Pilot) => {
    const cost = calculatePilotCost(pilot.level);
    if (credits < cost) {
      toast({
        title: 'Insufficient Credits',
        description: `You need ${cost} credits to hire this pilot.`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    dispatch(hirePilot({ pilot, cost }));
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Available {selectedRank} Pilots</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {availablePilots.map((pilot) => (
              <Box key={pilot.id} p={4} borderWidth={1} borderRadius="md" borderColor="gray.600">
                <Grid templateColumns="1fr auto" gap={4}>
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontSize="lg" fontWeight="bold">{pilot.name}</Text>
                      <Text color="cyan.400">"{pilot.callSign}"</Text>
                      <Badge colorScheme={pilot.rank === 'Elite' ? 'red' : pilot.rank === 'Seasoned' ? 'yellow' : 'green'}>
                        {pilot.rank}
                      </Badge>
                    </HStack>
                    
                    <Text>Level {pilot.level} | Age {pilot.age} | {pilot.sex}</Text>
                    
                    <Grid templateColumns="1fr auto auto" gap={2}>
                      <Text>Air-to-Air:</Text>
                      <Text>{pilot.skills.airToAir}</Text>
                      <Text color="gray.400">XP: {pilot.experience.airToAir}</Text>
                      
                      <Text>Air-to-Ground:</Text>
                      <Text>{pilot.skills.airToGround}</Text>
                      <Text color="gray.400">XP: {pilot.experience.airToGround}</Text>
                      
                      <Text>ECM:</Text>
                      <Text>{pilot.skills.ecm}</Text>
                      <Text color="gray.400">XP: {pilot.experience.ecm}</Text>
                      
                      <Text>ECCM:</Text>
                      <Text>{pilot.skills.eccm}</Text>
                      <Text color="gray.400">XP: {pilot.experience.eccm}</Text>
                      
                      <Text>Maneuver:</Text>
                      <Text>{pilot.skills.maneuver}</Text>
                      <Text color="gray.400">XP: {pilot.experience.maneuver}</Text>
                      
                      <Text>Survival:</Text>
                      <Text>{pilot.skills.survival}</Text>
                      <Text color="gray.400">XP: {pilot.experience.survival}</Text>

                      <Text>Morale:</Text>
                      <Text color={pilot.morale >= 75 ? "green.400" : pilot.morale >= 50 ? "yellow.400" : "red.400"}>
                        {pilot.morale}
                      </Text>
                      <Text color="gray.400">Status: {pilot.morale >= 75 ? "High" : pilot.morale >= 50 ? "Normal" : "Low"}</Text>

                      <Text>Fatigue:</Text>
                      <Text color={pilot.fatigue <= 25 ? "green.400" : pilot.fatigue <= 50 ? "yellow.400" : "red.400"}>
                        {pilot.fatigue}
                      </Text>
                      <Text color="gray.400">Status: {pilot.fatigue <= 25 ? "Rested" : pilot.fatigue <= 50 ? "Normal" : "Tired"}</Text>
                    </Grid>

                    <Grid templateColumns="1fr auto" gap={2}>
                      <Text>Combat Record:</Text>
                      <Text></Text>

                      <Text>Air-to-Air Kills:</Text>
                      <Text color="red.400">{pilot.combatRecord.airToAirKills}</Text>
                      
                      <Text>Ground Targets:</Text>
                      <Text color="orange.400">{pilot.combatRecord.groundTargetKills}</Text>
                    </Grid>
                  </VStack>
                  
                  <VStack align="end" justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color="green.400">
                      {calculatePilotCost(pilot.level)} Credits
                    </Text>
                    <Button
                      colorScheme="blue"
                      onClick={() => handleHirePilot(pilot)}
                      isDisabled={credits < calculatePilotCost(pilot.level)}
                    >
                      Hire Pilot
                    </Button>
                  </VStack>
                </Grid>
              </Box>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PilotSelectionModal; 