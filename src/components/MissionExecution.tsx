import React, { useState } from 'react';
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
  useDisclosure,
  Checkbox,
  Progress,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  useToast,
  Portal,
} from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { completeMission, updatePilotStatus } from '../store/squadronSlice';
import type { Mission, Pilot, Spacefighter } from '../types';

interface MissionExecutionProps {
  mission: Mission;
  onComplete: () => void;
}

const MissionExecution: React.FC<MissionExecutionProps> = ({ mission, onComplete }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { isOpen: isExecutionOpen, onOpen: onExecutionOpen, onClose: onExecutionClose } = useDisclosure();
  const { isOpen: isSummaryOpen, onOpen: onSummaryOpen, onClose: onSummaryClose } = useDisclosure();
  const { pilots, spacefighters } = useSelector((state: RootState) => state.squadron);
  
  const [selectedPilots, setSelectedPilots] = useState<string[]>([]);
  const [selectedSpacefighters, setSelectedSpacefighters] = useState<string[]>([]);
  const [missionOutcome, setMissionOutcome] = useState<{
    success: boolean;
    injuredPilots: string[];
    lostEquipment: boolean;
    damagedFighters: boolean;
    reward: number;
  } | null>(null);

  const availablePilots = pilots.filter(p => p.status === 'available');
  const availableSpacefighters = spacefighters.filter(s => s.status === 'ready');

  const handlePilotSelection = (pilotId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPilots([...selectedPilots, pilotId]);
      const assignedFighter = spacefighters.find(f => f.pilot?.id === pilotId);
      if (assignedFighter && !selectedSpacefighters.includes(assignedFighter.id)) {
        setSelectedSpacefighters([...selectedSpacefighters, assignedFighter.id]);
      }
    } else {
      setSelectedPilots(selectedPilots.filter(id => id !== pilotId));
      const assignedFighter = spacefighters.find(f => f.pilot?.id === pilotId);
      if (assignedFighter) {
        setSelectedSpacefighters(selectedSpacefighters.filter(id => id !== assignedFighter.id));
      }
    }
  };

  const handleSpacefighterSelect = (fighterId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSpacefighters([...selectedSpacefighters, fighterId]);
      const fighter = spacefighters.find(f => f.id === fighterId);
      const pilotId = fighter?.pilot?.id;
      if (pilotId && !selectedPilots.includes(pilotId)) {
        setSelectedPilots([...selectedPilots, pilotId]);
      }
    } else {
      setSelectedSpacefighters(selectedSpacefighters.filter(id => id !== fighterId));
      const fighter = spacefighters.find(f => f.id === fighterId);
      const pilotId = fighter?.pilot?.id;
      if (pilotId) {
        setSelectedPilots(selectedPilots.filter(id => id !== pilotId));
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
        default:
          relevantSkill = (pilot.skills.airToAir + pilot.skills.airToGround + pilot.skills.maneuver) / 3;
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
    const injuredPilots: string[] = [];
    let lostEquipment = false;
    let damagedFighters = false;

    // Update pilot status and experience
    selectedPilots.forEach(pilotId => {
      const pilot = pilots.find(p => p.id === pilotId);
      if (pilot && mission.risks) {
        const isInjured = Math.random() < mission.risks.pilotInjuryChance;
        if (isInjured) {
          injuredPilots.push(pilot.callSign);
        }
        dispatch(updatePilotStatus({ 
          pilotId, 
          status: success ? 'available' : isInjured ? 'injured' : 'available' 
        }));
      }
    });

    // Check for equipment loss and fighter damage
    if (mission.risks) {
      lostEquipment = Math.random() < mission.risks.equipmentLossChance;
      damagedFighters = Math.random() < mission.risks.spacefighterDamageChance;
    }

    // Set mission outcome
    const outcome = {
      success,
      injuredPilots,
      lostEquipment,
      damagedFighters,
      reward: success ? mission.reward : 0
    };
    setMissionOutcome(outcome);

    // Complete mission in Redux
    dispatch(completeMission({ missionId: mission.id, success }));

    // Close execution modal and show summary
    onExecutionClose();
    onSummaryOpen();

    // Show toast
    toast({
      title: "Mission Complete",
      description: `Mission ${success ? "succeeded" : "failed"}!`,
      status: success ? "success" : "error",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <>
      <Button
        colorScheme="blue"
        onClick={onExecutionOpen}
        isDisabled={mission.status !== 'pending'}
      >
        Execute Mission
      </Button>

      <Portal>
        {/* Mission Execution Modal */}
        <Modal 
          isOpen={isExecutionOpen} 
          onClose={onExecutionClose} 
          size="xl"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Mission Execution: {mission.name}</ModalHeader>
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
                          onChange={(e) => handleSpacefighterSelect(fighter.id, e.target.checked)}
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

        {/* Mission Summary Modal */}
        <Modal 
          isOpen={isSummaryOpen} 
          onClose={() => {
            onSummaryClose();
            setMissionOutcome(null);
            onComplete();
          }}
          size="md"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack>
                <Heading size="md">Mission Summary</Heading>
                {missionOutcome && (
                  <Badge colorScheme={missionOutcome.success ? "green" : "red"}>
                    {missionOutcome.success ? "Success" : "Failure"}
                  </Badge>
                )}
              </HStack>
            </ModalHeader>
            <ModalBody pb={6}>
              {missionOutcome && (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontWeight="bold" mb={2}>Mission Outcome:</Text>
                    <Text>{mission.name} - {missionOutcome.success ? "Successfully Completed" : "Mission Failed"}</Text>
                  </Box>

                  {missionOutcome.success && missionOutcome.reward > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="green.400">
                        Reward Earned: {missionOutcome.reward} credits
                      </Text>
                    </Box>
                  )}

                  {missionOutcome.injuredPilots.length > 0 && (
                    <Box>
                      <Text fontWeight="bold" color="red.400" mb={2}>Casualties:</Text>
                      {missionOutcome.injuredPilots.map(pilot => (
                        <Text key={pilot} color="red.400">• {pilot} was injured</Text>
                      ))}
                    </Box>
                  )}

                  {(missionOutcome.lostEquipment || missionOutcome.damagedFighters) && (
                    <Box>
                      <Text fontWeight="bold" color="orange.400" mb={2}>Equipment Status:</Text>
                      {missionOutcome.lostEquipment && (
                        <Text color="orange.400">• Some equipment was lost during the mission</Text>
                      )}
                      {missionOutcome.damagedFighters && (
                        <Text color="orange.400">• Some fighters sustained damage</Text>
                      )}
                    </Box>
                  )}

                  <Button 
                    colorScheme="blue" 
                    onClick={() => {
                      onSummaryClose();
                      setMissionOutcome(null);
                      onComplete();
                    }} 
                    mt={4}
                  >
                    Continue
                  </Button>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Portal>
    </>
  );
};

export default MissionExecution; 