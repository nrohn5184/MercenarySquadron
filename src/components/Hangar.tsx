import { Box, Button, Grid, Heading, Text, Flex, Select, Badge, VStack, HStack, Divider } from '@chakra-ui/react';
import { Tabs, TabList, TabPanels, TabPanel, Tab } from '@chakra-ui/tabs';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { addSpacefighter, purchaseEquipment, assignPilotToSpacefighter, unassignPilotFromSpacefighter, assignEquipmentToSpacefighter, removeEquipmentFromSpacefighter } from '../store/squadronSlice';
import { v4 as uuidv4 } from 'uuid';
import type { Spacefighter, Equipment } from '../types';

const generateSpacefighter = (): Spacefighter => {
  const names = ['Raptor', 'Viper', 'Phoenix', 'Falcon', 'Dragon', 'Hawk'];
  
  return {
    id: uuidv4(),
    name: `${names[Math.floor(Math.random() * names.length)]}-${Math.floor(Math.random() * 1000)}`,
    equipment: {
      missiles: [],
      bombs: [],
      flares: [],
    },
    status: 'ready',
  };
};

// Permanent equipment (non-consumable)
const shopEquipment: Equipment[] = [
  {
    id: 'laser-1',
    name: 'Basic Laser Cannon',
    type: 'weapon',
    stats: { damage: 50 },
    cost: 2000,
    description: 'Standard-issue laser cannon with decent damage output',
  },
  {
    id: 'shield-1',
    name: 'Standard Shield Generator',
    type: 'shield',
    stats: { defense: 40 },
    cost: 1500,
    description: 'Basic energy shield providing moderate protection',
  },
  {
    id: 'engine-1',
    name: 'Ion Engine',
    type: 'engine',
    stats: { speed: 60 },
    cost: 1800,
    description: 'Reliable ion engine with good thrust-to-weight ratio',
  },
];

// Consumable munitions and countermeasures
const armoryEquipment: Equipment[] = [
  {
    id: 'missile-1',
    name: 'AIM-120 AMRAAM',
    type: 'missile',
    stats: { 
      damage: 80,
      range: 100,
    },
    cost: 3000,
    description: 'Advanced Medium-Range Air-to-Air Missile with active radar homing',
  },
  {
    id: 'missile-2',
    name: 'AIM-9 Sidewinder',
    type: 'missile',
    stats: { 
      damage: 70,
      range: 40,
    },
    cost: 2000,
    description: 'Short-range air-to-air missile with infrared tracking',
  },
  {
    id: 'bomb-1',
    name: 'GBU-12 Paveway II',
    type: 'bomb',
    stats: { 
      damage: 120,
      blast_radius: 50,
    },
    cost: 4000,
    description: 'Laser-guided bomb for precision ground strikes',
  },
  {
    id: 'bomb-2',
    name: 'Mk-82 JDAM',
    type: 'bomb',
    stats: { 
      damage: 100,
      blast_radius: 40,
    },
    cost: 3500,
    description: 'GPS/INS guided bomb with all-weather capability',
  },
  {
    id: 'flare-1',
    name: 'MJU-7/B Flares',
    type: 'flare',
    stats: { 
      countermeasure_rating: 60,
    },
    cost: 1000,
    description: 'Standard countermeasure flares for missile defense',
  },
  {
    id: 'flare-2',
    name: 'Advanced IR Decoys',
    type: 'flare',
    stats: { 
      countermeasure_rating: 80,
    },
    cost: 2000,
    description: 'Advanced infrared decoys with improved effectiveness',
  },
];

const Hangar = () => {
  const dispatch = useDispatch();
  const { spacefighters, equipment, pilots, credits } = useSelector((state: RootState) => state.squadron);

  const handlePurchaseSpacefighter = () => {
    const cost = 5000;
    if (credits >= cost) {
      dispatch(addSpacefighter(generateSpacefighter()));
    }
  };

  const handlePurchaseEquipment = (item: Equipment) => {
    if (credits >= item.cost) {
      dispatch(purchaseEquipment(item));
    }
  };

  const handleAssignPilot = (spacefighterId: string, pilotId: string) => {
    dispatch(assignPilotToSpacefighter({ spacefighterId, pilotId }));
  };

  const handleUnassignPilot = (spacefighterId: string) => {
    dispatch(unassignPilotFromSpacefighter({ spacefighterId }));
  };

  const handleAssignEquipment = (spacefighterId: string, equipmentId: string, slot: string) => {
    dispatch(assignEquipmentToSpacefighter({ 
      spacefighterId, 
      equipmentId, 
      slot: slot as 'weapon' | 'shield' | 'engine' | 'special' | 'missiles' | 'bombs' | 'flares'
    }));
  };

  const handleRemoveEquipment = (spacefighterId: string, equipmentId: string, slot: string) => {
    dispatch(removeEquipmentFromSpacefighter({
      spacefighterId,
      equipmentId,
      slot: slot as 'weapon' | 'shield' | 'engine' | 'special' | 'missiles' | 'bombs' | 'flares'
    }));
  };

  const renderEquipmentStats = (stats: Equipment['stats']) => {
    return Object.entries(stats).map(([key, value]) => (
      <Text key={key} fontSize="sm">
        {key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1)}: {value}
      </Text>
    ));
  };

  const renderEquipmentSlot = (fighter: Spacefighter, slot: keyof Spacefighter['equipment'], label: string) => {
    const equip = fighter.equipment[slot];
    const compatibleEquipment = equipment.filter(e => {
      if (slot === 'missiles' || slot === 'bombs' || slot === 'flares') {
        return e.type === slot.slice(0, -1);
      }
      return e.type === slot;
    });

    if (Array.isArray(equip)) {
      // Render array-type equipment (missiles, bombs, flares)
      return (
        <Box mb={3}>
          <Text fontWeight="bold" mb={2}>{label}:</Text>
          {equip.length > 0 ? (
            <VStack align="stretch" spacing={2}>
              {equip.map((item) => (
                <HStack key={item.id} justify="space-between">
                  <Text fontSize="sm">{item.name}</Text>
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => handleRemoveEquipment(fighter.id, item.id, slot)}
                  >
                    Remove
                  </Button>
                </HStack>
              ))}
            </VStack>
          ) : (
            <Text fontSize="sm" color="gray.500">None</Text>
          )}
          {compatibleEquipment.length > 0 && (
            <Select
              size="sm"
              mt={2}
              placeholder="Add equipment..."
              onChange={(e) => handleAssignEquipment(fighter.id, e.target.value, slot)}
            >
              {compatibleEquipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(', ')})
                </option>
              ))}
            </Select>
          )}
        </Box>
      );
    } else {
      // Render single-slot equipment
      return (
        <Box mb={3}>
          <Text fontWeight="bold" mb={2}>{label}:</Text>
          {equip ? (
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm">{equip.name}</Text>
                {renderEquipmentStats(equip.stats)}
              </VStack>
              <Button
                size="xs"
                colorScheme="red"
                onClick={() => handleRemoveEquipment(fighter.id, equip.id, slot)}
              >
                Remove
              </Button>
            </HStack>
          ) : (
            <Text fontSize="sm" color="gray.500">None</Text>
          )}
          {compatibleEquipment.length > 0 && (
            <Select
              size="sm"
              mt={2}
              placeholder="Select equipment..."
              onChange={(e) => handleAssignEquipment(fighter.id, e.target.value, slot)}
            >
              {compatibleEquipment.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({Object.entries(item.stats).map(([k, v]) => `${k}: ${v}`).join(', ')})
                </option>
              ))}
            </Select>
          )}
        </Box>
      );
    }
  };

  const renderEquipmentCard = (item: Equipment, showPurchaseButton: boolean = true) => (
    <Box key={item.id} bg="gray.700" p={4} borderRadius="md">
      <Heading size="md" mb={2}>{item.name}</Heading>
      <Badge mb={3} colorScheme={
        item.type === 'weapon' ? 'red' :
        item.type === 'shield' ? 'blue' :
        item.type === 'engine' ? 'green' :
        item.type === 'missile' ? 'orange' :
        item.type === 'bomb' ? 'purple' :
        item.type === 'flare' ? 'yellow' :
        'gray'
      }>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
      </Badge>
      <Text fontSize="sm" mb={3} color="gray.400">{item.description}</Text>
      <Text mb={2}>Stats:</Text>
      <VStack align="start" spacing={1} mb={4}>
        {renderEquipmentStats(item.stats)}
      </VStack>
      {showPurchaseButton && (
        <Button
          colorScheme="green"
          width="100%"
          onClick={() => handlePurchaseEquipment(item)}
          isDisabled={credits < item.cost}
        >
          Purchase ({item.cost} Credits)
        </Button>
      )}
    </Box>
  );

  const renderInventorySection = (title: string, items: Equipment[]) => (
    <Box mb={8}>
      <Heading size="md" mb={4}>{title}</Heading>
      {items.length > 0 ? (
        <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
          {items.map(item => renderEquipmentCard(item, false))}
        </Grid>
      ) : (
        <Box bg="gray.700" p={4} borderRadius="md">
          <Text color="gray.400">No items in inventory</Text>
        </Box>
      )}
    </Box>
  );

  // Filter equipment by type
  const permanentEquipment = equipment.filter(item => 
    ['weapon', 'shield', 'engine', 'special'].includes(item.type)
  );

  const munitions = equipment.filter(item => 
    ['missile', 'bomb', 'flare'].includes(item.type)
  );

  return (
    <Box>
      <Heading mb={6}>Squadron Hangar</Heading>
      
      <Tabs>
        <TabList>
          <Tab>Spacefighters</Tab>
          <Tab>Equipment Shop</Tab>
          <Tab>Armory</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontSize="lg">Available Spacefighters: {spacefighters.length}</Text>
              <Button colorScheme="blue" onClick={handlePurchaseSpacefighter}>
                Purchase New Fighter (5000 Credits)
              </Button>
            </Flex>

            <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
              {spacefighters.map((fighter) => (
                <Box key={fighter.id} bg="gray.700" p={4} borderRadius="md">
                  <Heading size="md" mb={3}>{fighter.name}</Heading>
                  
                  <Text mb={2}>Status: {fighter.status}</Text>
                  
                  <HStack mb={2} justify="space-between">
                    <Text>Pilot: {fighter.pilot ? fighter.pilot.name : 'None'}</Text>
                    {fighter.pilot && (
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleUnassignPilot(fighter.id)}
                      >
                        Unassign
                      </Button>
                    )}
                  </HStack>
                  
                  {!fighter.pilot && (
                    <Box mb={4}>
                      <Text mb={2}>Assign Pilot:</Text>
                      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                        {pilots
                          .filter(p => p.status === 'available')
                          .map(pilot => (
                            <Button
                              key={pilot.id}
                              size="sm"
                              onClick={() => handleAssignPilot(fighter.id, pilot.id)}
                            >
                              {pilot.name}
                            </Button>
                          ))}
                      </Grid>
                    </Box>
                  )}

                  <Divider my={4} />
                  
                  <Text fontWeight="bold" mb={3}>Equipment:</Text>
                  {renderEquipmentSlot(fighter, 'weapon', 'Primary Weapon')}
                  {renderEquipmentSlot(fighter, 'shield', 'Shield')}
                  {renderEquipmentSlot(fighter, 'engine', 'Engine')}
                  {renderEquipmentSlot(fighter, 'special', 'Special')}
                  
                  <Divider my={4} />
                  
                  <Text fontWeight="bold" mb={3}>Munitions and Countermeasures:</Text>
                  {renderEquipmentSlot(fighter, 'missiles', 'Missiles')}
                  {renderEquipmentSlot(fighter, 'bombs', 'Bombs')}
                  {renderEquipmentSlot(fighter, 'flares', 'Countermeasures')}
                </Box>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel>
            <Text fontSize="lg" mb={4}>Manage your permanent equipment inventory.</Text>
            
            {renderInventorySection('Current Equipment Inventory', permanentEquipment)}
            
            <Divider my={6} />
            
            <Heading size="md" mb={4}>Available for Purchase</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
              {shopEquipment.map(item => renderEquipmentCard(item))}
            </Grid>
          </TabPanel>

          <TabPanel>
            <Text fontSize="lg" mb={4}>Manage your munitions and countermeasures inventory.</Text>
            
            <Box bg="gray.700" p={4} borderRadius="md" mb={6}>
              <Text color="yellow.400" fontWeight="bold">⚠️ Note: Munitions and countermeasures are consumed during missions.</Text>
            </Box>

            {renderInventorySection('Current Munitions Inventory', munitions)}
            
            <Divider my={6} />
            
            <Heading size="md" mb={4}>Available for Purchase</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
              {armoryEquipment.map(item => renderEquipmentCard(item))}
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Hangar; 