import { 
  Box, 
  Button, 
  Grid, 
  Heading, 
  Text, 
  Stack, 
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Checkbox,
  Progress,
  VStack,
  HStack,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { completeMission, updatePilotStatus } from '../store/squadronSlice';
import type { Mission, Pilot, Spacefighter } from '../types';
import { useState, useMemo } from 'react';

interface MissionExecutionProps {
  mission: Mission;
  onComplete: () => void;
}

const MissionExecution: React.FC<MissionExecutionProps> = ({ mission, onComplete }) => {
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { pilots, spacefighters } = useSelector((state: RootState) => state.squadron);
  
  const [selectedPilots, setSelectedPilots] = useState<string[]>([]);
  const [selectedSpacefighters, setSelectedSpacefighters] = useState<string[]>([]);

  const availablePilots = useMemo(() => 
    pilots.filter(p => p.status === 'available'), [pilots]);

  const availableSpacefighters = useMemo(() => 
    spacefighters.filter(s => s.status === 'ready'), [spacefighters]);

  // When a pilot is selected/unselected, handle their assigned fighter
  const handlePilotSelection = (pilotId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPilots([...selectedPilots, pilotId]);
      // If pilot has an assigned fighter, select it too
      const assignedFighter = spacefighters.find(f => f.pilot?.id === pilotId);
      if (assignedFighter && !selectedSpacefighters.includes(assignedFighter.id)) {
        setSelectedSpacefighters([...selectedSpacefighters, assignedFighter.id]);
      }
    } else {
      setSelectedPilots(selectedPilots.filter(id => id !== pilotId));
      // If pilot has an assigned fighter, unselect it too
      const assignedFighter = spacefighters.find(f => f.pilot?.id === pilotId);
      if (assignedFighter) {
        setSelectedSpacefighters(selectedSpacefighters.filter(id => id !== assignedFighter.id));
      }
    }
  };

  // When a fighter is selected/unselected, handle its assigned pilot
  const handleFighterSelection = (fighterId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSpacefighters([...selectedSpacefighters, fighterId]);
      // If fighter has an assigned pilot, select them too
      const fighter = spacefighters.find(f => f.id === fighterId);
      if (fighter?.pilot && !selectedPilots.includes(fighter.pilot.id)) {
        setSelectedPilots([...selectedPilots, fighter.pilot.id]);
      }
    } else {
      setSelectedSpacefighters(selectedSpacefighters.filter(id => id !== fighterId));
      // If fighter has an assigned pilot, unselect them too
      const fighter = spacefighters.find(f => f.id === fighterId);
      if (fighter?.pilot) {
        setSelectedPilots(selectedPilots.filter(id => id !== fighter.pilot.id));
      }
    }
  };

  const calculateMissionSuccessChance = () => {
    if (selectedPilots.length === 0 || selectedSpacefighters.length === 0) return 0;

    const selectedPilotObjects = pilots.filter(p => selectedPilots.includes(p.id));
    const selectedSpacefighterObjects = spacefighters.filter(s => selectedSpacefighters.includes(s.id));

    // Calculate average pilot skill relevant to mission type
    const avgPilotSkill = selectedPilotObjects.reduce((acc, pilot) => {
      let relevantSkill = 0;
      if (mission.type) {
        switch (mission.type) {
          case 'patrol':
          case 'intercept':
            relevantSkill = (pilot.skills.airToAir + pilot.skills.maneuver) / 2;
            break;
          case 'strike':
            relevantSkill = (pilot.skills.airToGround + pilot.skills.survival) / 2;
            break;
          case 'escort':
            relevantSkill = (pilot.skills.airToAir + pilot.skills.eccm) / 2;
            break;
          case 'recon':
            relevantSkill = (pilot.skills.ecm + pilot.skills.survival) / 2;
            break;
        }
      } else {
        // Default to average of all combat skills if no specific type
        relevantSkill = (
          pilot.skills.airToAir + 
          pilot.skills.airToGround + 
          pilot.skills.maneuver
        ) / 3;
      }
      return acc + relevantSkill;
    }, 0) / selectedPilotObjects.length;

    // Factor in equipment
    const equipmentBonus = selectedSpacefighterObjects.reduce((acc, fighter) => {
      let bonus = 0;
      if (fighter.equipment.weapon) bonus += 10;
      if (fighter.equipment.shield) bonus += 10;
      if (fighter.equipment.engine) bonus += 10;
      if (mission.requirements.recommendedEquipment?.missiles && fighter.equipment.missiles.length > 0) bonus += 10;
      if (mission.requirements.recommendedEquipment?.bombs && fighter.equipment.bombs.length > 0) bonus += 10;
      if (mission.requirements.recommendedEquipment?.flares && fighter.equipment.flares.length > 0) bonus += 10;
      return acc + bonus;
    }, 0) / selectedSpacefighterObjects.length;

    // Calculate final success chance
    let successChance = (avgPilotSkill * 0.6) + (equipmentBonus * 0.4);
    
    // Adjust for mission difficulty
    switch (mission.difficulty) {
      case 'easy':
        successChance *= 1.2;
        break;
      case 'medium':
        successChance *= 1.0;
        break;
      case 'hard':
        successChance *= 0.8;
        break;
    }

    return Math.min(100, Math.max(0, successChance));
  };

  const executeMission = () => {
    const successChance = calculateMissionSuccessChance();
    const success = Math.random() * 100 <= successChance;

    // Update pilot status and experience
    selectedPilots.forEach(pilotId => {
      const pilot = pilots.find(p => p.id === pilotId);
      if (pilot) {
        // Update status
        dispatch(updatePilotStatus({ 
          pilotId, 
          status: success ? 'available' : 
            (mission.risks && Math.random() < mission.risks.pilotInjuryChance) ? 'injured' : 'available' 
        }));

        // TODO: Add experience gain based on mission outcome
      }
    });

    // Complete mission
    dispatch(completeMission({ missionId: mission.id, success }));
    onClose();
    onComplete();
  };

  const getMissionTypeColor = (type: Mission['type']) => {
    switch (type) {
      case 'patrol': return 'blue';
      case 'escort': return 'green';
      case 'strike': return 'red';
      case 'intercept': return 'orange';
      case 'recon': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <>
      <Button
        colorScheme="blue"
        onClick={onOpen}
        isDisabled={mission.status !== 'pending'}
      >
        Execute Mission
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            <HStack>
              <Heading size="md">{mission.name}</Heading>
              <Badge colorScheme={getMissionTypeColor(mission.type)}>{mission.type}</Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text mb={2}>{mission.description}</Text>
                {mission.objectives && (
                  <>
                    <Text fontWeight="bold" mb={2}>Objectives:</Text>
                    <Text>• {mission.objectives.primary}</Text>
                    {mission.objectives.secondary && (
                      <Text>• {mission.objectives.secondary} (Optional)</Text>
                    )}
                  </>
                )}
              </Box>

              <Grid templateColumns="1fr 1fr" gap={6}>
                <Box>
                  <Heading size="sm" mb={3}>Select Pilots ({selectedPilots.length}/{mission.requirements.minPilots})</Heading>
                  <VStack align="stretch" spacing={2}>
                    {availablePilots.map(pilot => (
                      <Checkbox
                        key={pilot.id}
                        isChecked={selectedPilots.includes(pilot.id)}
                        onChange={(e) => handlePilotSelection(pilot.id, e.target.checked)}
                      >
                        {pilot.callSign} - Level {pilot.level}
                        {spacefighters.find(f => f.pilot?.id === pilot.id) && (
                          <Badge ml={2} colorScheme="blue">Assigned</Badge>
                        )}
                      </Checkbox>
                    ))}
                  </VStack>
                </Box>

                <Box>
                  <Heading size="sm" mb={3}>Select Spacefighters ({selectedSpacefighters.length}/{mission.requirements.minPilots})</Heading>
                  <VStack align="stretch" spacing={2}>
                    {availableSpacefighters.map(fighter => (
                      <Checkbox
                        key={fighter.id}
                        isChecked={selectedSpacefighters.includes(fighter.id)}
                        onChange={(e) => handleFighterSelection(fighter.id, e.target.checked)}
                      >
                        {fighter.name}
                        {fighter.pilot && (
                          <Badge ml={2} colorScheme="blue">Piloted</Badge>
                        )}
                      </Checkbox>
                    ))}
                  </VStack>
                </Box>
              </Grid>

              <Box>
                <Heading size="sm" mb={3}>Mission Success Chance</Heading>
                <Progress
                  value={calculateMissionSuccessChance()}
                  colorScheme={
                    calculateMissionSuccessChance() >= 75 ? "green" :
                    calculateMissionSuccessChance() >= 50 ? "yellow" : "red"
                  }
                  mb={2}
                />
                <Text>{Math.round(calculateMissionSuccessChance())}%</Text>
              </Box>

              <Box>
                <Heading size="sm" mb={3}>Mission Risks</Heading>
                <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                  <Box>
                    <Text>Pilot Injury</Text>
                    <Text color="red.400">{Math.round((mission.risks?.pilotInjuryChance || 0) * 100)}%</Text>
                  </Box>
                  <Box>
                    <Text>Equipment Loss</Text>
                    <Text color="red.400">{Math.round((mission.risks?.equipmentLossChance || 0) * 100)}%</Text>
                  </Box>
                  <Box>
                    <Text>Fighter Damage</Text>
                    <Text color="red.400">{Math.round((mission.risks?.spacefighterDamageChance || 0) * 100)}%</Text>
                  </Box>
                </Grid>
              </Box>

              {selectedPilots.length < mission.requirements.minPilots && (
                <Alert status="warning">
                  <AlertIcon />
                  Not enough pilots selected
                </Alert>
              )}

              {selectedSpacefighters.length < mission.requirements.minPilots && (
                <Alert status="warning">
                  <AlertIcon />
                  Not enough spacefighters selected
                </Alert>
              )}

              <Button
                colorScheme="blue"
                onClick={executeMission}
                isDisabled={
                  selectedPilots.length < mission.requirements.minPilots ||
                  selectedSpacefighters.length < mission.requirements.minPilots
                }
              >
                Launch Mission
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MissionExecution; 