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
  Badge,
} from '@chakra-ui/react';

interface PilotRankSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRank: (rank: 'Rookie' | 'Seasoned' | 'Elite') => void;
}

const PilotRankSelectionModal: React.FC<PilotRankSelectionModalProps> = ({ isOpen, onClose, onSelectRank }) => {
  const ranks = [
    {
      name: 'Rookie',
      description: 'Level 1-3 pilots. Basic training, lower cost.',
      color: 'green',
      levelRange: '1-3',
      costRange: '1,500-2,500'
    },
    {
      name: 'Seasoned',
      description: 'Level 4-6 pilots. Experienced veterans.',
      color: 'yellow',
      levelRange: '4-6',
      costRange: '3,000-4,000'
    },
    {
      name: 'Elite',
      description: 'Level 7-10 pilots. The best of the best.',
      color: 'red',
      levelRange: '7-10',
      costRange: '4,500-6,000'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Select Pilot Rank</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            {ranks.map((rank) => (
              <Button
                key={rank.name}
                height="auto"
                p={4}
                onClick={() => onSelectRank(rank.name as 'Rookie' | 'Seasoned' | 'Elite')}
                variant="outline"
                borderColor={`${rank.color}.500`}
                _hover={{ bg: `${rank.color}.900` }}
              >
                <VStack align="start" spacing={2} width="100%">
                  <Badge colorScheme={rank.color} fontSize="md" px={2} py={1}>
                    {rank.name}
                  </Badge>
                  <Text fontSize="sm" color="gray.300">{rank.description}</Text>
                  <Text fontSize="xs" color="gray.400">Level Range: {rank.levelRange}</Text>
                  <Text fontSize="xs" color="gray.400">Cost Range: {rank.costRange} credits</Text>
                </VStack>
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PilotRankSelectionModal; 