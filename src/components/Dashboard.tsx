import { Box, Grid, Heading, Text, Stack, Progress } from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Dashboard = () => {
  const squadron = useSelector((state: RootState) => state.squadron);

  const calculateSquadronStrength = () => {
    const pilotStrength = squadron.pilots.reduce((acc: number, pilot) => {
      const avgSkills = (
        pilot.skills.airToAir + 
        pilot.skills.airToGround + 
        pilot.skills.ecm + 
        pilot.skills.eccm +
        pilot.skills.maneuver +
        pilot.skills.survival
      ) / 6;
      return acc + avgSkills;
    }, 0);
    return Math.min(100, (pilotStrength / (squadron.pilots.length || 1)) * 20);
  };

  const availablePilots = squadron.pilots.filter(p => p.status === 'available').length;

  return (
    <Box>
      <Heading mb={6}>Squadron Dashboard</Heading>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <Box bg="gray.700" p={4} borderRadius="md">
          <Stack direction="column" gap={4}>
            <Heading size="md">Squadron Status</Heading>
            <Text>Total Pilots: {squadron.pilots.length}</Text>
            <Text>Available Pilots: {availablePilots}</Text>
            <Text>Spacefighters: {squadron.spacefighters.length}</Text>
            <Text>Equipment Items: {squadron.equipment.length}</Text>
          </Stack>
        </Box>

        <Box bg="gray.700" p={4} borderRadius="md">
          <Stack direction="column" gap={4}>
            <Heading size="md">Resources</Heading>
            <Text>Credits: {squadron.credits}</Text>
            <Text>Reputation: {squadron.reputation}</Text>
            <Text>Squadron Strength</Text>
            <Progress
              value={calculateSquadronStrength()}
              colorScheme="blue"
              width="100%"
            />
          </Stack>
        </Box>

        {squadron.activeCampaign && (
          <Box bg="gray.700" p={4} borderRadius="md" gridColumn="span 2">
            <Stack direction="column" gap={4}>
              <Heading size="md">Active Campaign</Heading>
              <Text>Name: {squadron.activeCampaign.name}</Text>
              <Text>Progress: Day {squadron.activeCampaign.currentDay} of {squadron.activeCampaign.duration}</Text>
              <Progress
                value={(squadron.activeCampaign.currentDay / squadron.activeCampaign.duration) * 100}
                colorScheme="green"
                width="100%"
              />
              <Text>Missions Remaining: {squadron.activeCampaign.missions.length}</Text>
            </Stack>
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 