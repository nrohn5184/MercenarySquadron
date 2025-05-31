import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Pilot } from '../types';

interface PilotState {
  pilots: Pilot[];
}

const initialState: PilotState = {
  pilots: []
};

export const pilotSlice = createSlice({
  name: 'pilots',
  initialState,
  reducers: {
    updatePilotStatus: (state: PilotState, action: PayloadAction<{ pilotId: string; status: Pilot['status'] }>) => {
      const pilot = state.pilots.find((p: Pilot) => p.id === action.payload.pilotId);
      if (pilot) {
        const oldStatus = pilot.status;
        pilot.status = action.payload.status;

        // Apply status-specific effects
        switch (action.payload.status) {
          case 'available':
            // No special effects
            break;
          case 'onCall':
            // Being on call increases fatigue slightly but boosts morale
            pilot.fatigue = Math.min(100, pilot.fatigue + 5);
            pilot.morale = Math.min(100, pilot.morale + 10);
            break;
          case 'training':
            // Training increases fatigue but can boost morale
            pilot.fatigue = Math.min(100, pilot.fatigue + 15);
            pilot.morale = Math.min(100, pilot.morale + 5);
            break;
          case 'rAndR':
            // R&R reduces fatigue and improves morale
            pilot.fatigue = Math.max(0, pilot.fatigue - 30);
            pilot.morale = Math.min(100, pilot.morale + 20);
            break;
        }

        // If coming out of R&R, apply refreshed bonus
        if (oldStatus === 'rAndR' && action.payload.status !== 'rAndR') {
          pilot.morale = Math.min(100, pilot.morale + 10);
          pilot.fatigue = Math.max(0, pilot.fatigue - 20);
        }
      }
    },
  }
});

export const { updatePilotStatus } = pilotSlice.actions;
export default pilotSlice.reducer; 