import { Box, Flex, Link, Heading, Spacer, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

const Navigation = () => {
  const { credits, reputation } = useSelector((state: RootState) => state.squadron);

  return (
    <Box bg="gray.900" px={4} py={2}>
      <Flex alignItems="center">
        <Heading size="md" color="blue.400">Mercenary Squadron</Heading>
        <Spacer />
        <Flex gap={4} alignItems="center">
          <Link as={RouterLink} to="/" color="gray.200" _hover={{ color: 'white' }}>
            Dashboard
          </Link>
          <Link as={RouterLink} to="/pilots" color="gray.200" _hover={{ color: 'white' }}>
            Pilots
          </Link>
          <Link as={RouterLink} to="/hangar" color="gray.200" _hover={{ color: 'white' }}>
            Hangar
          </Link>
          <Link as={RouterLink} to="/campaigns" color="gray.200" _hover={{ color: 'white' }}>
            Campaigns
          </Link>
          <Text color="yellow.400">Credits: {credits}</Text>
          <Text color="purple.400">Rep: {reputation}</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navigation; 