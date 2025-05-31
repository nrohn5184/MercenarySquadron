export interface Pilot {
  id: string;
  name: string;
  callSign: string;
  rank: string;
  level: number;
  age: number;
  sex: 'M' | 'F' | 'Other';
  skills: {
    airToAir: number;
    airToGround: number;
    ecm: number;  // Electronic Counter Measures
    eccm: number; // Electronic Counter-Counter Measures
    maneuver: number; // Pilot's ability to maneuver their craft
    survival: number; // Pilot's ability to survive critical situations
  };
  experience: {
    airToAir: number;
    airToGround: number;
    ecm: number;
    eccm: number;
    maneuver: number;
    survival: number;
  };
  combatRecord: {
    airToAirKills: number;  // Number of enemy aircraft shot down
    groundTargetKills: number;  // Number of ground targets destroyed
  };
  status: 'available' | 'deployed' | 'injured' | 'training' | 'onCall' | 'rAndR';
  morale: number;  // 0-100: Affects performance and decision making
  fatigue: number; // 0-100: Higher means more tired, affects performance
}

export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'shield' | 'engine' | 'special' | 'missile' | 'bomb' | 'flare';
  stats: {
    damage?: number;
    defense?: number;
    speed?: number;
    special?: string;
    range?: number;
    blast_radius?: number;
    countermeasure_rating?: number;
  };
  cost: number;
  description: string;
}

export interface Spacefighter {
  id: string;
  name: string;
  pilot?: Pilot;
  equipment: {
    weapon?: Equipment;
    shield?: Equipment;
    engine?: Equipment;
    special?: Equipment;
    missiles: Equipment[];
    bombs: Equipment[];
    flares: Equipment[];
  };
  status: 'ready' | 'damaged' | 'repairing';
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type?: 'patrol' | 'escort' | 'strike' | 'intercept' | 'recon';
  reward: number;
  duration: number; // in days
  requirements: {
    minPilots: number;
    minCombatRating: number;
    recommendedEquipment?: {
      weapons?: boolean;
      missiles?: boolean;
      bombs?: boolean;
      flares?: boolean;
    };
    recommendedSkills?: {
      airToAir?: number;
      airToGround?: number;
      ecm?: number;
      eccm?: number;
      maneuver?: number;
      survival?: number;
    };
  };
  risks?: {
    pilotInjuryChance: number;
    equipmentLossChance: number;
    spacefighterDamageChance: number;
  };
  objectives?: {
    primary: string;
    secondary?: string;
  };
  status?: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  missions: Mission[];
  duration: number; // total days
  currentDay: number;
  status: 'pending' | 'active' | 'completed' | 'failed';
  reward: number;
}

export interface Squadron {
  name: string;
  credits: number;
  reputation: number;
  pilots: Pilot[];
  spacefighters: Spacefighter[];
  equipment: Equipment[];
  activeCampaign?: Campaign;
} 