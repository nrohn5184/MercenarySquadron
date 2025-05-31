import { Box, Button, Grid, Heading, Text, VStack as ChakraVStack, HStack as ChakraHStack, useToast, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { dismissPilot, updatePilotStatus } from '../store/squadronSlice';
import type { Pilot } from '../types';
import PilotSelectionModal from './PilotSelectionModal';
import PilotRankSelectionModal from './PilotRankSelectionModal';
import { useState, useRef } from 'react';

const PilotManagement = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const [selectedRank, setSelectedRank] = useState<'Rookie' | 'Seasoned' | 'Elite' | null>(null);
  const [pilotToDismiss, setPilotToDismiss] = useState<Pilot | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const rankSelection = useDisclosure();
  const pilotSelection = useDisclosure();
  const dismissAlert = useDisclosure();
  const { pilots, credits } = useSelector((state: RootState) => state.squadron);

  const handleStartHiring = () => {
    setSelectedRank(null);
    rankSelection.onOpen();
  };

  const handleRankSelect = (rank: 'Rookie' | 'Seasoned' | 'Elite') => {
    setSelectedRank(rank);
    rankSelection.onClose();
    pilotSelection.onOpen();
  };

  const handlePilotSelectionClose = () => {
    pilotSelection.onClose();
    setSelectedRank(null);
  };

  const handleDismissPilot = (pilot: Pilot) => {
    setPilotToDismiss(pilot);
    dismissAlert.onOpen();
  };

  const confirmDismissPilot = () => {
    if (pilotToDismiss) {
      dispatch(dismissPilot(pilotToDismiss.id));
      toast({
        title: "Pilot Dismissed",
        description: `${pilotToDismiss.callSign} has been dismissed from the squadron.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
    dismissAlert.onClose();
    setPilotToDismiss(null);
  };

  const handleUpdateStatus = (pilotId: string, status: Pilot['status']) => {
    dispatch(updatePilotStatus({ pilotId, status }));
  };

  return (
    <Box>
      <ChakraHStack justify="space-between" align="center" marginBottom={6}>
        <Heading>Pilot Management</Heading>
        <Button colorScheme="blue" onClick={handleStartHiring}>
          Hire New Pilot
        </Button>
      </ChakraHStack>

      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {pilots.map((pilot) => (
          <Box key={pilot.id} bg="gray.700" p={4} borderRadius="md">
            <ChakraVStack align="stretch" gap={3}>
              <ChakraHStack justify="space-between">
                <Heading size="md">{pilot.name}</Heading>
                <Text color="yellow.400">{pilot.rank}</Text>
              </ChakraHStack>
              
              <ChakraHStack justify="space-between">
                <Text color="cyan.400">"{pilot.callSign}"</Text>
                <Text>Level {pilot.level}</Text>
              </ChakraHStack>

              <ChakraHStack justify="space-between">
                <Text>Age: {pilot.age}</Text>
                <Text>Sex: {pilot.sex}</Text>
              </ChakraHStack>
              
              <ChakraVStack align="stretch" gap={2}>
                <Text fontWeight="bold" mb={1}>Skills & Experience:</Text>
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
                </Grid>
              </ChakraVStack>

              <ChakraVStack align="stretch" gap={2}>
                <Text fontWeight="bold" mb={1}>Combat Record:</Text>
                <Grid templateColumns="1fr auto" gap={2}>
                  <Text>Air-to-Air Kills:</Text>
                  <Text color="red.400">{pilot.combatRecord.airToAirKills}</Text>
                  
                  <Text>Ground Targets:</Text>
                  <Text color="orange.400">{pilot.combatRecord.groundTargetKills}</Text>
                </Grid>
              </ChakraVStack>

              <ChakraVStack align="stretch" gap={2}>
                <Text fontWeight="bold" mb={1}>Pilot Status:</Text>
                <Grid templateColumns="1fr auto auto" gap={2}>
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
              </ChakraVStack>

              <ChakraVStack align="stretch" gap={2}>
                <Text fontWeight="bold" mb={1}>Duty Status:</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  <Button
                    size="sm"
                    colorScheme={pilot.status === 'available' ? 'green' : 'gray'}
                    onClick={() => handleUpdateStatus(pilot.id, 'available')}
                  >
                    Available
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={pilot.status === 'onCall' ? 'orange' : 'gray'}
                    onClick={() => handleUpdateStatus(pilot.id, 'onCall')}
                  >
                    On Call
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={pilot.status === 'training' ? 'blue' : 'gray'}
                    onClick={() => handleUpdateStatus(pilot.id, 'training')}
                  >
                    Training
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={pilot.status === 'rAndR' ? 'purple' : 'gray'}
                    onClick={() => handleUpdateStatus(pilot.id, 'rAndR')}
                    isDisabled={pilot.fatigue < 50}
                  >
                    R&R
                  </Button>
                </Grid>
              </ChakraVStack>

              <Button
                colorScheme="red"
                size="sm"
                onClick={() => handleDismissPilot(pilot)}
              >
                Dismiss Pilot
              </Button>
            </ChakraVStack>
          </Box>
        ))}
      </Grid>

      <PilotRankSelectionModal 
        isOpen={rankSelection.isOpen} 
        onClose={rankSelection.onClose}
        onSelectRank={handleRankSelect}
      />

      {selectedRank && (
        <PilotSelectionModal 
          isOpen={pilotSelection.isOpen} 
          onClose={handlePilotSelectionClose}
          selectedRank={selectedRank}
        />
      )}

      <AlertDialog
        isOpen={dismissAlert.isOpen}
        leastDestructiveRef={cancelRef}
        onClose={dismissAlert.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Dismiss Pilot
            </AlertDialogHeader>

            <AlertDialogBody>
              {pilotToDismiss && (
                <>
                  Are you sure you want to dismiss {pilotToDismiss.callSign}?
                  <Text mt={2} color="gray.400">
                    This action cannot be undone. The pilot will permanently leave your squadron.
                  </Text>
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={dismissAlert.onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDismissPilot} ml={3}>
                Dismiss
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default PilotManagement; 