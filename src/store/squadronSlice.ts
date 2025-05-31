import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Pilot, Spacefighter, Equipment, Campaign } from '../types';

interface SquadronState {
  name: string;
  credits: number;
  reputation: number;
  pilots: Pilot[];
  spacefighters: Spacefighter[];
  equipment: Equipment[];
  activeCampaign?: Campaign;
}

const initialState: SquadronState = {
  name: 'Stellar Hawks',
  credits: 100000,
  reputation: 0,
  pilots: [],
  spacefighters: [],
  equipment: [],
};

interface HirePilotPayload {
  pilot: Pilot;
  cost: number;
}

const squadronSlice = createSlice({
  name: 'squadron',
  initialState,
  reducers: {
    hirePilot(state, action: PayloadAction<HirePilotPayload>) {
      const { pilot, cost } = action.payload;
      state.pilots.push(pilot);
      state.credits -= cost;
    },
    dismissPilot(state, action: PayloadAction<string>) {
      state.pilots = state.pilots.filter(pilot => pilot.id !== action.payload);
    },
    updatePilotStatus(state, action: PayloadAction<{ pilotId: string; status: Pilot['status'] }>) {
      const pilot = state.pilots.find(p => p.id === action.payload.pilotId);
      if (pilot) {
        pilot.status = action.payload.status;
      }
    },
    addSpacefighter(state, action: PayloadAction<Spacefighter>) {
      state.spacefighters.push(action.payload);
      state.credits -= 5000; // Basic fighter cost
    },
    purchaseEquipment(state, action: PayloadAction<Equipment>) {
      state.equipment.push(action.payload);
      state.credits -= action.payload.cost;
    },
    assignEquipmentToSpacefighter(state, action: PayloadAction<{ 
      spacefighterId: string; 
      equipmentId: string;
      slot: 'weapon' | 'shield' | 'engine' | 'special' | 'missiles' | 'bombs' | 'flares';
    }>) {
      const { spacefighterId, equipmentId, slot } = action.payload;
      const fighter = state.spacefighters.find(f => f.id === spacefighterId);
      
      // Find the first matching equipment
      const equipmentIndex = state.equipment.findIndex(e => e.id === equipmentId);
      if (equipmentIndex === -1 || !fighter) return;
      
      const equipment = state.equipment[equipmentIndex];

      // Remove only one equipment from inventory
      state.equipment.splice(equipmentIndex, 1);

      // For arrays (missiles, bombs, flares)
      if (slot === 'missiles' || slot === 'bombs' || slot === 'flares') {
        if (equipment.type === slot.slice(0, -1)) { // Remove 's' from end
          fighter.equipment[slot].push(equipment);
        }
      } else {
        // For single equipment slots
        if (fighter.equipment[slot]) {
          // Return old equipment to inventory
          state.equipment.push(fighter.equipment[slot]!);
        }
        fighter.equipment[slot] = equipment;
      }
    },
    removeEquipmentFromSpacefighter(state, action: PayloadAction<{
      spacefighterId: string;
      equipmentId: string;
      slot: 'weapon' | 'shield' | 'engine' | 'special' | 'missiles' | 'bombs' | 'flares';
    }>) {
      const { spacefighterId, equipmentId, slot } = action.payload;
      const fighter = state.spacefighters.find(f => f.id === spacefighterId);
      
      if (!fighter) return;

      if (slot === 'missiles' || slot === 'bombs' || slot === 'flares') {
        const equipment = fighter.equipment[slot].find(e => e.id === equipmentId);
        if (equipment) {
          fighter.equipment[slot] = fighter.equipment[slot].filter(e => e.id !== equipmentId);
          state.equipment.push(equipment);
        }
      } else {
        if (fighter.equipment[slot] && fighter.equipment[slot]!.id === equipmentId) {
          state.equipment.push(fighter.equipment[slot]!);
          fighter.equipment[slot] = undefined;
        }
      }
    },
    assignPilotToSpacefighter(state, action: PayloadAction<{ spacefighterId: string; pilotId: string }>) {
      const { spacefighterId, pilotId } = action.payload;
      const pilot = state.pilots.find(p => p.id === pilotId);
      const fighter = state.spacefighters.find(f => f.id === spacefighterId);
      
      if (pilot && fighter) {
        fighter.pilot = pilot;
        pilot.status = 'deployed';
      }
    },
    unassignPilotFromSpacefighter(state, action: PayloadAction<{ spacefighterId: string }>) {
      const { spacefighterId } = action.payload;
      const fighter = state.spacefighters.find(f => f.id === spacefighterId);
      
      if (fighter && fighter.pilot?.id) {
        const pilot = state.pilots.find(p => p.id === fighter.pilot.id);
        if (pilot) {
          pilot.status = 'available';
        }
        fighter.pilot = undefined;
      }
    },
    startCampaign(state, action: PayloadAction<Campaign>) {
      state.activeCampaign = action.payload;
    },
    completeMission(state, action: PayloadAction<{ missionId: string; success: boolean }>) {
      if (!state.activeCampaign) return;

      const mission = state.activeCampaign.missions.find(m => m.id === action.payload.missionId);
      if (!mission) return;

      if (action.payload.success) {
        state.credits += mission.reward;
        state.reputation += 10;
      } else {
        state.reputation -= 5;
      }

      state.activeCampaign.missions = state.activeCampaign.missions.filter(m => m.id !== action.payload.missionId);
      state.activeCampaign.currentDay += mission.duration;

      if (state.activeCampaign.missions.length === 0) {
        state.credits += state.activeCampaign.reward;
        state.reputation += 25;
        state.activeCampaign = undefined;
      }
    },
  },
});

export const {
  hirePilot,
  dismissPilot,
  updatePilotStatus,
  addSpacefighter,
  purchaseEquipment,
  assignEquipmentToSpacefighter,
  removeEquipmentFromSpacefighter,
  assignPilotToSpacefighter,
  unassignPilotFromSpacefighter,
  startCampaign,
  completeMission,
} = squadronSlice.actions;

export default squadronSlice.reducer; 