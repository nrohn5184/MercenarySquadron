import { Box, Button, Grid, Heading, Text, Stack, Badge } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { startCampaign, completeMission } from '../store/squadronSlice';
import { v4 as uuidv4 } from 'uuid';
import type { Campaign, Mission } from '../types';
import MissionExecution from './MissionExecution';

const availableCampaigns: Campaign[] = [
  {
    id: uuidv4(),
    name: 'Border Skirmish',
    description: 'Protect the border colonies from pirate raids',
    missions: [
      {
        id: uuidv4(),
        name: 'Patrol Route Alpha',
        description: 'Establish presence in the sector',
        type: 'patrol',
        difficulty: 'easy',
        reward: 2000,
        duration: 1,
        requirements: {
          minPilots: 2,
          minCombatRating: 40,
          recommendedEquipment: {
            weapons: true,
            missiles: true,
            flares: true
          },
          recommendedSkills: {
            airToAir: 40,
            maneuver: 35
          }
        },
        risks: {
          pilotInjuryChance: 0.1,
          equipmentLossChance: 0.15,
          spacefighterDamageChance: 0.2
        },
        objectives: {
          primary: 'Patrol the designated route and detect any hostile activity',
          secondary: 'Map any anomalies in the sector'
        },
        status: 'pending'
      },
      {
        id: uuidv4(),
        name: 'Intercept Raiders',
        description: 'Stop pirate raiders from attacking a colony',
        type: 'intercept',
        difficulty: 'medium',
        reward: 3500,
        duration: 2,
        requirements: {
          minPilots: 3,
          minCombatRating: 55,
          recommendedEquipment: {
            weapons: true,
            missiles: true,
            flares: true
          },
          recommendedSkills: {
            airToAir: 50,
            maneuver: 45,
            eccm: 40
          }
        },
        risks: {
          pilotInjuryChance: 0.2,
          equipmentLossChance: 0.25,
          spacefighterDamageChance: 0.3
        },
        objectives: {
          primary: 'Prevent raiders from reaching the colony',
          secondary: 'Destroy or capture raider vessels'
        },
        status: 'pending'
      },
    ],
    duration: 7,
    currentDay: 0,
    status: 'pending',
    reward: 10000,
  },
  {
    id: uuidv4(),
    name: 'Corporate Security',
    description: 'Provide security for corporate mining operations',
    missions: [
      {
        id: uuidv4(),
        name: 'Escort Mining Ships',
        description: 'Protect mining vessels during operations',
        type: 'escort',
        difficulty: 'medium',
        reward: 3000,
        duration: 2,
        requirements: {
          minPilots: 2,
          minCombatRating: 50,
          recommendedEquipment: {
            weapons: true,
            missiles: true,
            flares: true
          },
          recommendedSkills: {
            airToAir: 45,
            eccm: 40,
            survival: 35
          }
        },
        risks: {
          pilotInjuryChance: 0.15,
          equipmentLossChance: 0.2,
          spacefighterDamageChance: 0.25
        },
        objectives: {
          primary: 'Protect mining vessels from hostile forces',
          secondary: 'Ensure no mining operations are interrupted'
        },
        status: 'pending'
      },
      {
        id: uuidv4(),
        name: 'Defend Processing Station',
        description: 'Protect the main processing facility from attack',
        type: 'strike',
        difficulty: 'hard',
        reward: 5000,
        duration: 3,
        requirements: {
          minPilots: 4,
          minCombatRating: 65,
          recommendedEquipment: {
            weapons: true,
            missiles: true,
            bombs: true,
            flares: true
          },
          recommendedSkills: {
            airToGround: 60,
            airToAir: 55,
            survival: 50
          }
        },
        risks: {
          pilotInjuryChance: 0.3,
          equipmentLossChance: 0.35,
          spacefighterDamageChance: 0.4
        },
        objectives: {
          primary: 'Defend the processing station from enemy forces',
          secondary: 'Eliminate all hostile ground installations'
        },
        status: 'pending'
      },
    ],
    duration: 10,
    currentDay: 0,
    status: 'pending',
    reward: 15000,
  },
];

const Campaigns = () => {
  const dispatch = useDispatch();
  const { activeCampaign, pilots } = useSelector((state: RootState) => state.squadron);

  const calculateSquadronCombatRating = () => {
    const availablePilots = pilots.filter(p => p.status === 'available' || p.status === 'deployed');
    if (availablePilots.length === 0) return 0;
    return availablePilots.reduce((acc: number, pilot) => {
      const combatSkills = (pilot.skills.airToAir + pilot.skills.airToGround + pilot.skills.maneuver) / 3;
      return acc + combatSkills;
    }, 0) / availablePilots.length;
  };

  const canStartCampaign = (campaign: Campaign) => {
    const availablePilots = pilots.filter(p => p.status === 'available' || p.status === 'deployed');
    const combatRating = calculateSquadronCombatRating();
    
    return campaign.missions.every(mission => 
      availablePilots.length >= mission.requirements.minPilots &&
      combatRating >= mission.requirements.minCombatRating
    );
  };

  const handleStartCampaign = (campaign: Campaign) => {
    if (canStartCampaign(campaign)) {
      dispatch(startCampaign({ ...campaign, status: 'active' }));
    }
  };

  const getDifficultyColor = (difficulty: Mission['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'gray';
    }
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
    <Box>
      <Heading mb={6}>Campaigns</Heading>

      {activeCampaign ? (
        <Box bg="gray.700" p={6} borderRadius="md" mb={6}>
          <Heading size="md" mb={4}>Active Campaign: {activeCampaign.name}</Heading>
          <Text mb={4}>{activeCampaign.description}</Text>
          <Text mb={4}>Day {activeCampaign.currentDay} of {activeCampaign.duration}</Text>
          
          <Heading size="sm" mb={3}>Missions:</Heading>
          <Stack direction="column" gap={4}>
            {activeCampaign.missions.map((mission) => (
              <Box key={mission.id} bg="gray.600" p={4} borderRadius="md">
                <Grid templateColumns="1fr auto" gap={4} alignItems="start">
                  <Box>
                    <Heading size="sm" mb={2}>{mission.name}</Heading>
                    <Text fontSize="sm" mb={2}>{mission.description}</Text>
                    <Stack direction="row" spacing={2} mb={2}>
                      <Badge colorScheme={getDifficultyColor(mission.difficulty)}>
                        {mission.difficulty}
                      </Badge>
                      {mission.type && (
                        <Badge colorScheme={getMissionTypeColor(mission.type)}>
                          {mission.type}
                        </Badge>
                      )}
                    </Stack>
                    <Text fontSize="sm" mb={2}>
                      Requirements: {mission.requirements.minPilots} pilots, 
                      {mission.requirements.minCombatRating}+ combat rating
                    </Text>
                    {mission.objectives && (
                      <>
                        <Text fontSize="sm" fontWeight="bold">Objectives:</Text>
                        <Text fontSize="sm">• {mission.objectives.primary}</Text>
                        {mission.objectives.secondary && (
                          <Text fontSize="sm">• {mission.objectives.secondary} (Optional)</Text>
                        )}
                      </>
                    )}
                  </Box>
                  <Stack direction="column" gap={2} align="flex-end">
                    <Text>Reward: {mission.reward} credits</Text>
                    <Text>Duration: {mission.duration} days</Text>
                    <MissionExecution 
                      mission={mission}
                      onComplete={() => {
                        // Mission completed, no additional action needed as the
                        // completeMission action will update the campaign state
                      }}
                    />
                  </Stack>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Box>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {availableCampaigns.map((campaign) => (
            <Box key={campaign.id} bg="gray.700" p={4} borderRadius="md">
              <Heading size="md" mb={3}>{campaign.name}</Heading>
              <Text mb={4}>{campaign.description}</Text>
              
              <Text mb={2}>Duration: {campaign.duration} days</Text>
              <Text mb={4}>Total Reward: {campaign.reward} credits</Text>

              <Box mb={4} p={3} bg="gray.600" borderRadius="md">
                <Text fontWeight="bold" mb={2}>Campaign Requirements:</Text>
                <Grid templateColumns="1fr auto" gap={2}>
                  <Text>Minimum Pilots Needed:</Text>
                  <Text>{Math.max(...campaign.missions.map(m => m.requirements.minPilots))}</Text>
                  
                  <Text>Minimum Combat Rating:</Text>
                  <Text>{Math.max(...campaign.missions.map(m => m.requirements.minCombatRating))}</Text>

                  <Text>Available Pilots:</Text>
                  <Text color={pilots.filter(p => p.status === 'available' || p.status === 'deployed').length >= Math.max(...campaign.missions.map(m => m.requirements.minPilots)) ? 'green.400' : 'red.400'}>
                    {pilots.filter(p => p.status === 'available' || p.status === 'deployed').length}
                  </Text>

                  <Text>Squadron Combat Rating:</Text>
                  <Text color={calculateSquadronCombatRating() >= Math.max(...campaign.missions.map(m => m.requirements.minCombatRating)) ? 'green.400' : 'red.400'}>
                    {Math.round(calculateSquadronCombatRating())}
                  </Text>
                </Grid>
              </Box>

              <Text mb={2}>Missions:</Text>
              <Stack direction="column" gap={2} mb={4}>
                {campaign.missions.map((mission) => (
                  <Box key={mission.id} p={2} bg="gray.600" borderRadius="md">
                    <Text fontWeight="bold">{mission.name}</Text>
                    <Stack direction="row" spacing={2}>
                      <Badge colorScheme={getDifficultyColor(mission.difficulty)}>
                        {mission.difficulty}
                      </Badge>
                      {mission.type && (
                        <Badge colorScheme={getMissionTypeColor(mission.type)}>
                          {mission.type}
                        </Badge>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <Button
                colorScheme="blue"
                width="100%"
                onClick={() => handleStartCampaign(campaign)}
                isDisabled={!canStartCampaign(campaign)}
              >
                Start Campaign
              </Button>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Campaigns; 