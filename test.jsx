import React, { useState, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

   

    // --- Data -----------------------------------------------------------------

    const exerciseLibrary = {
      'Squats': {
        muscles: { quads: 1, glutes: 0.6, core: 0.3 },
        category: 'primary',
        movementCategory: 'squat',
        variants: [
          'Back Squat',
          'Front Squat',
          'Safety Bar Squat',
          'Hack Squat',
          'Pendulum Squat',
          'Goblet Squat',
          'Leg Press',
          'Single-Leg Press',
          'Hack Squat Machine',
          'Belt Squat'
        ]
      },
      'Bench Press': {
        muscles: { chest: 1, triceps: 0.6, shoulders: 0.4 },
        category: 'primary',
        movementCategory: 'press',
        variants: [
          'Flat Barbell Bench',
          'Incline Bench',
          'Close Grip Bench',
          'Dumbbell Press',
          'Machine Press',
          'Push-ups',
          'Deficit Push-ups'
        ]
      },
      'Overhead Press': {
        muscles: { shoulders: 1, triceps: 0.7, upperBack: 0.3 },
        category: 'primary',
        movementCategory: 'press',
        variants: [
          'Standing Barbell Overhead Press',
          'Seated Dumbbell Shoulder Press',
          'Machine Shoulder Press'
        ]
      },
      'Deadlifts': {
        muscles: { glutes: 1, hamstrings: 1, upperBack: 0.6, core: 0.4 },
        category: 'primary',
        movementCategory: 'posterior',
        variants: ['Conventional Deadlift', 'Sumo Deadlift', 'Trap Bar Deadlift', 'Romanian Deadlift', 'Deficit Deadlift']
      },
      'Rows': {
        muscles: { upperBack: 1, lats: 0.6, biceps: 0.4 },
        category: 'primary',
        movementCategory: 'pull',
        variants: ['Barbell Row', 'Dumbbell Row', 'Chest-Supported Row', 'Cable Row']
      },
      'Pull-ups': {
        muscles: { lats: 1, upperBack: 0.4, biceps: 0.6 },
        category: 'primary',
        movementCategory: 'pull',
        variants: ['Pull-ups', 'Chin-ups', 'Neutral Grip', 'Band-Assisted Pull-ups', 'Assisted Pull-up Machine', 'Lat Pulldown']
      },
      'Lunges': {
        muscles: { quads: 1, glutes: 0.8 },
        category: 'primary',
        movementCategory: 'squat',
        variants: [
          'Walking Lunges',
          'Reverse Lunges',
          'Bulgarian Split Squats',
          'Static Lunges',
          'Step-ups'
        ]
      },
      'Hip Thrusts / Bridges': {
        muscles: { glutes: 1, hamstrings: 0.5 },
        category: 'primary',
        movementCategory: 'posterior',
        variants: [
          'Barbell Hip Thrust',
          'Dumbbell Hip Thrust',
          'Smith Machine Hip Thrust',
          'Single-Leg Hip Thrust',
          'Banded Hip Thrust',
          'Glute Bridge',
          'Single-Leg Glute Bridge',
          'Banded Glute Bridge',
          'Barbell Glute Bridge'
        ]
      },
      'Cable Kickbacks': {
        muscles: { glutes: 1 },
        category: 'accessory',
        movementCategory: 'posterior',
        variants: ['Cable Glute Kickback', 'Donkey Kicks', 'Fire Hydrants', 'Standing Kickback']
      },
      'Hip Abduction': {
        muscles: { glutes: 1 },
        category: 'accessory',
        movementCategory: 'posterior',
        variants: ['Abduction Machine', 'Banded Hip Abduction', 'Side-Lying Hip Abduction', 'Standing Cable Abduction']
      },
      'Leg Curls': {
        muscles: { hamstrings: 1 },
        category: 'accessory',
        movementCategory: 'posterior',
        variants: ['Lying Leg Curl', 'Seated Leg Curl', 'Nordic Curl']
      },
      'Leg Extensions': {
        muscles: { quads: 1 },
        category: 'accessory',
        movementCategory: 'squat',
        variants: ['Leg Extension Machine', 'Single-Leg Extension']
      },
      'Bicep Curls': {
        muscles: { biceps: 1 },
        category: 'accessory',
        movementCategory: 'pull',
        variants: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Cable Curl']
      },
      'Dips': {
        muscles: { chest: 0.8, triceps: 1, shoulders: 0.4 },
        category: 'accessory',
        movementCategory: 'press',
        variants: [
          'Parallel Bar Dips',
          'Assisted Dips',
          'Assisted Dip Machine',
          'Weighted Dips',
          'Bench Dips'
        ]
      },
      'Tricep Extensions': {
        muscles: { triceps: 1 },
        category: 'accessory',
        movementCategory: 'press',
        variants: ['Rope Pushdown', 'Overhead Extension', 'Skullcrushers', 'Kickbacks']
      },
      'Lateral Raises': {
        muscles: { shoulders: 1 },
        category: 'accessory',
        movementCategory: 'press',
        variants: ['Dumbbell Lateral Raise', 'Cable Lateral Raise', 'Machine Lateral Raise']
      },
      'Face Pulls': {
        muscles: { upperBack: 0.6, shoulders: 0.6 },
        category: 'accessory',
        movementCategory: 'pull',
        variants: ['Rope Face Pulls', 'Cable High Row']
      },
      'Rear Delt Flyes': {
        muscles: { shoulders: 1 },
        category: 'accessory',
        movementCategory: 'pull',
        variants: ['Dumbbell Rear Delt Fly', 'Cable Rear Delt Fly', 'Machine Reverse Fly', 'Bent-Over Rear Delt Raise']
      },
      'Chest Flyes': {
        muscles: { chest: 1 },
        category: 'accessory',
        movementCategory: 'press',
        variants: ['Dumbbell Fly', 'Cable Fly', 'Pec Deck Machine', 'Incline Fly', 'Decline Fly']
      },
      'Shrugs': {
        muscles: { upperBack: 1 },
        category: 'accessory',
        movementCategory: 'pull',
        variants: ['Barbell Shrug', 'Dumbbell Shrug', 'Trap Bar Shrug', 'Cable Shrug']
      },
      'Lat Pulldown': {
        muscles: { lats: 1, biceps: 0.4 },
        category: 'accessory',
        movementCategory: 'pull',
        variants: ['Wide Grip Lat Pulldown', 'Close Grip Lat Pulldown', 'Neutral Grip Pulldown', 'Single-Arm Pulldown']
      },
      'Calf Raises': {
        muscles: { calves: 1 },
        category: 'accessory',
        movementCategory: 'accessory',
        variants: ['Standing Calf Raises', 'Seated Calf Raises', 'Leg Press Calf Raises']
      },
      'Crunches': {
        muscles: { core: 1 },
        category: 'accessory',
        movementCategory: 'accessory',
        variants: ['Floor Crunch', 'Cable Crunch', 'Reverse Crunch']
      },
      'Planks': {
        muscles: { core: 1 },
        category: 'accessory',
        movementCategory: 'accessory',
        variants: ['Front Plank', 'Side Plank', 'Weighted Plank']
      },
      'Back Extensions': {
        muscles: { glutes: 0.6, hamstrings: 0.6, core: 0.4 },
        category: 'accessory',
        movementCategory: 'posterior',
        variants: ['Back Extensions', 'Reverse Hyper']
      },
      'Loaded Carries': {
        muscles: { upperBack: 0.6, core: 1, glutes: 0.4 },
        category: 'accessory',
        movementCategory: 'accessory',
        variants: ['Farmers Walk', 'Suitcase Carry', 'Overhead Carry', 'Waiter Walk', 'Trap Bar Carry'],
        isBonus: true
      }
    };

    const movementMuscles = {
      squat: ['quads', 'glutes'],
      posterior: ['hamstrings', 'glutes'],
      pull: ['lats', 'upperBack'],
      press: ['chest', 'shoulders', 'triceps']
    };

    const muscleGroups = {
      primary: ['chest', 'lats', 'upperBack', 'quads', 'glutes', 'hamstrings'],
      accessory: ['shoulders', 'biceps', 'triceps', 'calves', 'core']
    };

    const allMuscles = [...muscleGroups.primary, ...muscleGroups.accessory];
    const MESOCYCLE_WEEKS = 6;

    const majorLifts = {
      'Squats': ['quads', 'glutes'],
      'Bench Press': ['chest', 'triceps'],
      'Deadlifts': ['glutes', 'hamstrings', 'upperBack'],
      'Rows': ['upperBack', 'lats']
    };

    const movementCategoryMeta = {
      pull: {
        label: 'Pull',
        subtitle: 'Vertical & Horizontal Pulling',
        description: 'Pull-ups, rows, and pulldown variations',
        icon: '💪',
        gradient: 'from-blue-500 to-cyan-500',
        primaryMuscles: ['lats', 'upperBack'],
        accessoryMuscles: ['biceps']
      },
      squat: {
        label: 'Squat / Single-Leg',
        subtitle: 'Knee-Dominant Lower Body',
        description: 'Squats, leg press, lunges, split squats, step-ups',
        icon: '🦵',
        gradient: 'from-purple-500 to-pink-500',
        primaryMuscles: ['quads', 'glutes'],
        accessoryMuscles: []
      },
      press: {
        label: 'Press',
        subtitle: 'Horizontal & Vertical Pressing',
        description: 'Bench press, overhead press, push-ups, dips',
        icon: '💥',
        gradient: 'from-orange-500 to-red-500',
        primaryMuscles: ['chest'],
        accessoryMuscles: ['shoulders', 'triceps']
      },
      posterior: {
        label: 'Hip-Dominant',
        subtitle: 'Posterior Chain Power',
        description: 'Deadlifts, RDLs, hip thrusts, hamstring curls',
        icon: '⚡',
        gradient: 'from-emerald-500 to-teal-500',
        primaryMuscles: ['glutes', 'hamstrings'],
        accessoryMuscles: []
      }
    };

    const achievementDefinitions = {
      firstWorkout: { 
        icon: '🎯', 
        label: 'First Steps', 
        description: 'Log your first workout',
        check: (stats) => stats.totalWorkouts >= 1
      },
      week1Complete: { 
        icon: '✅', 
        label: 'Week Warrior', 
        description: 'Complete a full training week',
        check: (stats) => stats.weeksCompleted >= 1
      },
      perfectWeek: { 
        icon: '⭐', 
        label: 'Perfect Week', 
        description: 'Hit all 6 primary muscles in one week',
        check: (stats) => stats.perfectWeeks >= 1
      },
      streak3: { 
        icon: '🔥', 
        label: 'On Fire', 
        description: 'Maintain a 3-week streak',
        check: (stats) => stats.currentStreak >= 3
      },
      streak5: { 
        icon: '🔥🔥', 
        label: 'Unstoppable', 
        description: 'Maintain a 5-week streak',
        check: (stats) => stats.currentStreak >= 5
      },
      volume100: { 
        icon: '💯', 
        label: 'Century Club', 
        description: 'Log 100 total sets',
        check: (stats) => stats.totalSets >= 100
      },
      volume500: { 
        icon: '💪', 
        label: 'Volume Beast', 
        description: 'Log 500 total sets',
        check: (stats) => stats.totalSets >= 500
      },
      allMusclesHit: { 
        icon: '👑', 
        label: 'Completionist', 
        description: 'Hit all 11 muscle groups in one week',
        check: (stats) => stats.allMusclesHitWeeks >= 1
      },
      dedication: {
        icon: '🏆',
        label: 'Dedication',
        description: 'Log 50 workouts',
        check: (stats) => stats.totalWorkouts >= 50
      }
    };

    // Icons
    const ChevronDown = ({ className = "" }) => (
      <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    );
    const TrendingUp = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
    const SettingsIcon = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    );
    const CheckCircle = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
    const Plus = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
    const Minus = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
    const Zap = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
    const ArchiveIcon = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="4" rx="2" />
        <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
        <line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    );
    const Activity = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    );
    const Award = ({ className = "", size = 20 }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    );

    // Helpers
    const getWeekStart = (date = new Date()) => {
      const d = new Date(date);
      const day = (d.getDay() + 6) % 7; // Monday=0, Sunday=6
      d.setDate(d.getDate() - day);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    const daysBetween = (a, b) => {
      const ms = Math.abs(a - b);
      return Math.floor(ms / (1000 * 60 * 60 * 24));
    };

    const getVariantFamily = (variant) => {
      if (!variant) return 'other';
      const v = variant.toLowerCase();
      if (v.includes('barbell')) return 'barbell';
      if (v.includes('dumbbell') || v.includes('db')) return 'dumbbell';
      if (v.includes('machine') || v.includes('smith')) return 'machine';
      if (v.includes('cable') || v.includes('rope')) return 'cable';
      if (v.includes('push-up') || v.includes('pull-up') || v.includes('dip') || v.includes('chin-up')) return 'bodyweight';
      return 'other';
    };

    // Confetti function
    const triggerConfetti = () => {
      const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
      const confettiCount = 50;
      
      for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti-piece';
          confetti.style.left = Math.random() * window.innerWidth + 'px';
          confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.animationDelay = Math.random() * 0.3 + 's';
          document.body.appendChild(confetti);
          
          setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
      }
    };

    const App = () => {
      const [currentView, setCurrentView] = useState('workout');
      const [workoutHistory, setWorkoutHistory] = useState(() => {
        const saved = localStorage.getItem('medApp_workoutHistory');
        return saved ? JSON.parse(saved) : [];
      });
      const [lastStrengthWorkout, setLastStrengthWorkout] = useState(() => {
        const saved = localStorage.getItem('medApp_lastStrengthWorkout');
        return saved ? JSON.parse(saved) : {};
      });
      const [medTarget, setMedTarget] = useState(() => {
        const saved = localStorage.getItem('medApp_medTarget');
        return saved ? parseInt(saved) : 10;
      });
      const [lastUsedVariants, setLastUsedVariants] = useState(() => {
        const saved = localStorage.getItem('medApp_lastUsedVariants');
        return saved ? JSON.parse(saved) : {};
      });
      const [achievements, setAchievements] = useState(() => {
        const saved = localStorage.getItem('medApp_achievements');
        return saved ? JSON.parse(saved) : {};
      });
      const [personalBests, setPersonalBests] = useState(() => {
        const saved = localStorage.getItem('medApp_personalBests');
        return saved ? JSON.parse(saved) : {};
      });
      const [expandedExercises, setExpandedExercises] = useState({});
      const [expandedCategories, setExpandedCategories] = useState({});
      const [selectedVariants, setSelectedVariants] = useState({});
      const [setSets, setSetSets] = useState({});
      const [structuredSession, setStructuredSession] = useState(null);
      const [sessionProgress, setSessionProgress] = useState({});
      const [toasts, setToasts] = useState([]);
      const [showAlmostDone, setShowAlmostDone] = useState(false);
      const [almostDoneSuggestions, setAlmostDoneSuggestions] = useState([]);
      
      const [showQuickAdd, setShowQuickAdd] = useState(false);
      const [quickAddExercise, setQuickAddExercise] = useState('');
      const [quickAddVariant, setQuickAddVariant] = useState('');
      const [quickAddSets, setQuickAddSets] = useState(3);
      const [showPhilosophy, setShowPhilosophy] = useState(false);
      const [showQuickStart, setShowQuickStart] = useState(false);
      const [showBuilderTooltip, setShowBuilderTooltip] = useState(() => {
        const dismissed = localStorage.getItem('medApp_builderTooltipDismissed');
        return !dismissed;
      });
      const [showFirstLoadModal, setShowFirstLoadModal] = useState(() => {
        const hasSeenModal = localStorage.getItem('medApp_hasSeenOnboarding');
        const hasWorkouts = localStorage.getItem('medApp_workoutHistory');
        return !hasSeenModal && (!hasWorkouts || hasWorkouts === '[]');
      });
      
      const [currentWeekStart] = useState(() => getWeekStart());
      const [mesocycleStart] = useState(() => {
        const saved = localStorage.getItem('medApp_mesocycleStart');
        return saved ? new Date(saved) : getWeekStart();
      });

      // Persist
      useEffect(() => {
        localStorage.setItem('medApp_workoutHistory', JSON.stringify(workoutHistory));
      }, [workoutHistory]);
      useEffect(() => {
        localStorage.setItem('medApp_lastStrengthWorkout', JSON.stringify(lastStrengthWorkout));
      }, [lastStrengthWorkout]);
      useEffect(() => {
        localStorage.setItem('medApp_medTarget', medTarget.toString());
      }, [medTarget]);
      useEffect(() => {
        localStorage.setItem('medApp_lastUsedVariants', JSON.stringify(lastUsedVariants));
      }, [lastUsedVariants]);
      useEffect(() => {
        localStorage.setItem('medApp_achievements', JSON.stringify(achievements));
      }, [achievements]);
      useEffect(() => {
        localStorage.setItem('medApp_personalBests', JSON.stringify(personalBests));
      }, [personalBests]);

      // Init sets
      useEffect(() => {
        const initial = {};
        Object.keys(exerciseLibrary).forEach(name => {
          initial[name] = 3;
        });
        setSetSets(initial);
      }, []);

      // Toast system
      const showToast = useCallback((message, type = 'success', icon = '✓') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, icon }]);
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
      }, []);

      // Calculate weekly volumes
      const processWeeklyVolumes = useCallback(() => {
        const weekMap = new Map();
        
        workoutHistory.forEach(workout => {
          const workoutDate = new Date(workout.date);
          const weekStart = getWeekStart(workoutDate);
          const weekKey = weekStart.toISOString();
          
          if (!weekMap.has(weekKey)) {
            weekMap.set(weekKey, {
              weekStart: weekKey,
              volumes: {},
              workouts: []
            });
            allMuscles.forEach(m => weekMap.get(weekKey).volumes[m] = 0);
          }
          
          const weekData = weekMap.get(weekKey);
          weekData.workouts.push(workout);
          
          const exercise = exerciseLibrary[workout.exercise];
          if (exercise && !exercise.isBonus) { // Skip bonus exercises from volume calculations
            Object.entries(exercise.muscles).forEach(([muscle, multiplier]) => {
              if (allMuscles.includes(muscle)) {
                weekData.volumes[muscle] += workout.sets * multiplier;
              }
            });
          }
        });
        
        // Calculate grades
        weekMap.forEach((data, key) => {
          // Calculate average percentage across all 6 primary muscles
          let totalPercentage = 0;
          let musclesHit = 0;
          
          muscleGroups.primary.forEach(muscle => {
            const volume = data.volumes[muscle] || 0;
            const percentage = Math.min((volume / medTarget) * 100, 100); // Cap at 100
            totalPercentage += percentage;
            
            if (volume >= medTarget) {
              musclesHit++;
            }
          });
          
          const avgPercentage = totalPercentage / muscleGroups.primary.length;
          
          // Grade based on average percentage (with bonus for hitting targets)
          if (avgPercentage >= 100 || musclesHit === 6) {
            data.grade = { grade: 'S', color: 'from-purple-500 to-pink-500', label: 'Perfect!', musclesHit };
          } else if (avgPercentage >= 80 || musclesHit >= 5) {
            data.grade = { grade: 'A', color: 'from-blue-500 to-cyan-500', label: 'Excellent', musclesHit };
          } else if (avgPercentage >= 65 || musclesHit >= 4) {
            data.grade = { grade: 'B', color: 'from-green-500 to-emerald-500', label: 'Great', musclesHit };
          } else if (avgPercentage >= 50 || musclesHit >= 3) {
            data.grade = { grade: 'C', color: 'from-yellow-500 to-orange-500', label: 'Good', musclesHit };
          } else {
            data.grade = { grade: 'D', color: 'from-red-500 to-pink-500', label: 'Keep Going', musclesHit };
          }
          
          data.avgPercentage = avgPercentage;
        });
        
        const volumes = Array.from(weekMap.values())
          .sort((a, b) => new Date(b.weekStart) - new Date(a.weekStart))
          .slice(0, MESOCYCLE_WEEKS);
        
        return volumes;
      }, [workoutHistory, medTarget]);

      const weeklyVolumes = useMemo(() => processWeeklyVolumes(), [processWeeklyVolumes]);

      const getMesocycleAverage = useCallback(() => {
        if (weeklyVolumes.length === 0) {
          const empty = {};
          allMuscles.forEach(muscle => empty[muscle] = 0);
          return empty;
        }

        const totals = {};
        allMuscles.forEach(muscle => totals[muscle] = 0);

        weeklyVolumes.forEach(week => {
          allMuscles.forEach(muscle => {
            totals[muscle] += week.volumes[muscle] || 0;
          });
        });

        const averages = {};
        allMuscles.forEach(muscle => {
          averages[muscle] = totals[muscle] / weeklyVolumes.length;
        });

        return averages;
      }, [weeklyVolumes]);

      // Volumes / priorities
      const getCurrentWeekWorkouts = useCallback(() => {
        const end = new Date(currentWeekStart);
        end.setDate(end.getDate() + 7);
        return workoutHistory.filter(w => {
          const d = new Date(w.date);
          return d >= currentWeekStart && d < end;
        });
      }, [workoutHistory, currentWeekStart]);

      const calculateCurrentWeekVolume = useCallback(() => {
        const volume = {};
        allMuscles.forEach(m => (volume[m] = 0));
        getCurrentWeekWorkouts().forEach(w => {
          const ex = exerciseLibrary[w.exercise];
          if (!ex || ex.isBonus) return; // Skip bonus exercises from volume calculations
          Object.entries(ex.muscles).forEach(([muscle, mult]) => {
            if (!allMuscles.includes(muscle)) return;
            volume[muscle] += w.sets * mult;
          });
        });
        return volume;
      }, [getCurrentWeekWorkouts]);

      const getMuscleGroupPriorities = useCallback(() => {
        const current = calculateCurrentWeekVolume();
        const mesocycleAvg = getMesocycleAverage();
        
        return allMuscles
          .map(muscle => {
            const currentVol = current[muscle] || 0;
            const remaining = Math.max(0, medTarget - currentVol);
            const percentage = medTarget > 0 ? (currentVol / medTarget) * 100 : 0;
            const isPrimary = muscleGroups.primary.includes(muscle);
            const mesocycleAvg_ = mesocycleAvg[muscle] || 0;
            const chronicDeficit = isPrimary && mesocycleAvg_ < (medTarget * 0.8);
            const priority = remaining * (isPrimary ? 2 : 1) + (chronicDeficit ? 5 : 0);
            
            return {
              muscle,
              current: currentVol,
              remaining,
              percentage,
              isPrimary,
              mesocycleAvg: mesocycleAvg_,
              chronicDeficit,
              priority
            };
          })
          .sort((a, b) => b.priority - a.priority);
      }, [calculateCurrentWeekVolume, getMesocycleAverage, medTarget]);

      const getSmartRecommendations = useCallback(() => {
        const priorities = getMuscleGroupPriorities();
        const currentWeekVolume = calculateCurrentWeekVolume();

        const topNeeds = priorities
          .filter(p => p.isPrimary && p.remaining > 0)
          .slice(0, 6);

        const recs = [];

        Object.entries(exerciseLibrary).forEach(([exercise, data]) => {
          if (data.category === 'accessory') return;

          let score = 0;
          const targets = [];

          topNeeds.forEach(need => {
            const muscleScore = data.muscles[need.muscle] || 0;
            if (muscleScore > 0) {
              const alreadyHit = (currentWeekVolume[need.muscle] || 0) > 0;
              const zeroBoost = alreadyHit ? 1.0 : 1.5;
              const chronicBoost = need.chronicDeficit ? 1.5 : 1.0;
              const weight = need.remaining * 3 * zeroBoost * chronicBoost;
              score += muscleScore * weight;
              targets.push(need.muscle);
            }
          });

          if (score > 0) {
            const primaryMuscle =
              Object.entries(data.muscles).find(([_, s]) => s === 1)?.[0] ||
              targets[0] ||
              'mixed';

            recs.push({
              exercise,
              score: score.toFixed(1),
              targets: targets.length ? targets : [primaryMuscle],
              primaryMuscle,
              category: data.category,
              variants: data.variants,
              movementCategory: data.movementCategory || 'press'
            });
          }
        });

        // Only add major lifts if their movement pattern is completely missing
        const coveredCategories = new Set(recs.map(r => r.movementCategory));
        Object.keys(majorLifts).forEach(lift => {
          const exists = recs.some(r => r.exercise === lift);
          if (!exists && exerciseLibrary[lift]) {
            const data = exerciseLibrary[lift];
            const cat = data.movementCategory;
            
            // Only inject if this pattern isn't covered at all
            if (!coveredCategories.has(cat)) {
              const primaryMuscle =
                Object.entries(data.muscles).find(([_, s]) => s === 1)?.[0] ||
                'mixed';
              const targets = Object.keys(data.muscles).filter(m =>
                muscleGroups.primary.includes(m)
              );
              recs.push({
                exercise: lift,
                score: '0.1',
                targets: targets.length ? targets : [primaryMuscle],
                primaryMuscle,
                category: data.category,
                variants: data.variants,
                movementCategory: data.movementCategory || 'press'
              });
              coveredCategories.add(cat);
            }
          }
        });

        return recs.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
      }, [getMuscleGroupPriorities, calculateCurrentWeekVolume]);

      // Calculate stats for achievements
      const calculateStats = useCallback(() => {
        const totalWorkouts = workoutHistory.length;
        const totalSets = workoutHistory.reduce((sum, w) => sum + w.sets, 0);
        
        // Calculate streaks
        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;
        
        const sortedWeeks = [...weeklyVolumes].sort((a, b) => 
          new Date(a.weekStart) - new Date(b.weekStart)
        );
        
        sortedWeeks.forEach((week, index) => {
          // A week counts toward streak if it's a C grade or better (50%+ avg or 3+ muscles hit)
          const avgPercentage = week.avgPercentage || 0;
          const musclesHit = week.grade?.musclesHit || 0;
          const isGoodWeek = avgPercentage >= 50 || musclesHit >= 3;
          
          if (isGoodWeek) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
            
            // Check if this is current week
            if (week.weekStart === currentWeekStart.toISOString()) {
              currentStreak = tempStreak;
            }
          } else {
            tempStreak = 0;
          }
        });
        
        const perfectWeeks = weeklyVolumes.filter(week => {
          return week.grade?.grade === 'S'; // S grade = perfect week
        }).length;
        
        const allMusclesHitWeeks = weeklyVolumes.filter(week => {
          return allMuscles.every(m => (week.volumes[m] || 0) >= medTarget);
        }).length;
        
        const weeksCompleted = weeklyVolumes.filter(week => {
          const avgPercentage = week.avgPercentage || 0;
          const musclesHit = week.grade?.musclesHit || 0;
          return avgPercentage >= 50 || musclesHit >= 3; // C grade or better
        }).length;
        
        return {
          totalWorkouts,
          totalSets,
          currentStreak,
          bestStreak,
          perfectWeeks,
          allMusclesHitWeeks,
          weeksCompleted
        };
      }, [workoutHistory, weeklyVolumes, medTarget, currentWeekStart]);

      // Check and unlock achievements
      useEffect(() => {
        const stats = calculateStats();
        let newlyUnlocked = [];
        
        Object.entries(achievementDefinitions).forEach(([key, def]) => {
          if (!achievements[key] && def.check(stats)) {
            newlyUnlocked.push(key);
            setAchievements(prev => ({ ...prev, [key]: true }));
          }
        });
        
        if (newlyUnlocked.length > 0) {
          newlyUnlocked.forEach(key => {
            const def = achievementDefinitions[key];
            showToast(`Achievement Unlocked: ${def.label}!`, 'achievement', def.icon);
          });
        }
      }, [workoutHistory, achievements, calculateStats, showToast]);

      // Update personal bests
      const updatePersonalBests = useCallback((currentWeekVolume) => {
        let updated = false;
        const newBests = { ...personalBests };
        
        allMuscles.forEach(muscle => {
          const current = currentWeekVolume[muscle] || 0;
          const best = personalBests[muscle] || 0;
          
          if (current > best) {
            newBests[muscle] = current;
            updated = true;
          }
        });
        
        if (updated) {
          setPersonalBests(newBests);
        }
      }, [personalBests]);

      // Get exercises done this week to avoid repetition
      const getExercisesDoneThisWeek = useCallback(() => {
        const thisWeekWorkouts = getCurrentWeekWorkouts();
        return new Set(thisWeekWorkouts.map(w => w.exercise));
      }, [getCurrentWeekWorkouts]);

      // Calculate total remaining sets across all primary muscles
      const getTotalRemaining = useCallback(() => {
        const priorities = getMuscleGroupPriorities();
        return priorities
          .filter(p => p.isPrimary)
          .reduce((sum, p) => sum + p.remaining, 0);
      }, [getMuscleGroupPriorities]);

      // Determine session size based on remaining volume
      const getSessionSize = (priorities) => {
        const behind = priorities.filter(p => p.isPrimary && p.remaining >= 3).length;

        if (behind <= 1) return 2;
        if (behind <= 2) return 3;
        if (behind <= 4) return 4;
        return 5;
      };

      const buildPrioritySessionFromTopRecs = useCallback(() => {
        // Compute fresh to avoid temporal dead zone
        const smartRecs = getSmartRecommendations();
        const priorities = getMuscleGroupPriorities();
        const totalRemaining = getTotalRemaining();
        const sessionSize = Math.min(getSessionSize(priorities), 4);
        
        const accessoryNeeds = priorities
          .filter(p => !p.isPrimary && p.remaining > 0)
          .sort((a, b) => b.remaining - a.remaining)
          .slice(0, 3);
        
        if (!smartRecs || smartRecs.length === 0) return;

        const exercisesDoneThisWeek = getExercisesDoneThisWeek();
        
        // Prefer exercises NOT done this week
        const notDoneThisWeek = smartRecs.filter(rec => !exercisesDoneThisWeek.has(rec.exercise));
        const topPool = (notDoneThisWeek.length >= sessionSize ? notDoneThisWeek : smartRecs).slice(0, sessionSize + 5);
        const shuffled = [...topPool].sort(() => Math.random() - 0.5);

        const chosen = [];
        const usedCategories = new Set();

        // First pass: one from each movement category (up to sessionSize)
        shuffled.forEach(rec => {
          if (chosen.length >= sessionSize) return;
          const cat = rec.movementCategory || 'press';
          if (!usedCategories.has(cat)) {
            chosen.push(rec);
            usedCategories.add(cat);
          }
        });

        // Second pass: fill remaining slots
        if (chosen.length < sessionSize) {
          shuffled.forEach(rec => {
            if (chosen.length >= sessionSize) return;
            if (!chosen.some(c => c.exercise === rec.exercise)) {
              chosen.push(rec);
            }
          });
        }

        if (chosen.length === 0) return;

        // RANDOMIZE THE ORDER - don't always put highest priority first
        const randomizedOrder = [...chosen].sort(() => Math.random() - 0.5);

        // 35% chance to add an accessory finisher (only if session has room)
        let finisher = null;
        const shouldAddFinisher =
          accessoryNeeds &&
          accessoryNeeds.length > 0 &&
          chosen.length < 4 &&
          Math.random() < 0.35;

        if (shouldAddFinisher) {
          const topAccessoryNeed = accessoryNeeds[0];
          const accessoryCandidates = Object.entries(exerciseLibrary)
            .filter(([name, data]) => data.category === 'accessory')
            .filter(([_, data]) => !!data.muscles[topAccessoryNeed.muscle]);

          if (accessoryCandidates.length > 0) {
            const [name, data] =
              accessoryCandidates[
                Math.floor(Math.random() * accessoryCandidates.length)
              ];

            const primaryMuscle =
              Object.entries(data.muscles).find(([_, s]) => s === 1)?.[0] ||
              topAccessoryNeed.muscle;

            finisher = {
              exercise: name,
              score: null,
              targets: [topAccessoryNeed.muscle],
              primaryMuscle,
              category: data.category,
              variants: data.variants,
              movementCategory: data.movementCategory || 'accessory'
            };
          }
        }

        const [tier1, tier2, tier3, tier4, tier5, tier6] = randomizedOrder;

        setStructuredSession({
          lift: 'Priority-based',
          tier1,
          tier2: tier2 || null,
          tier3: tier3 || null,
          tier4: tier4 || finisher || null,
          tier5: tier5 || null,
          tier6: tier6 || null
        });
        
        setSessionProgress({}); // Reset progress for new session
        
        const sizeLabel = sessionSize === 2 ? 'quick finisher' : 
                          sessionSize === 3 ? 'light session' :
                          sessionSize === 4 ? 'balanced session' :
                          sessionSize === 5 ? 'solid session' : 
                          'big session';
        
        showToast(`${sessionSize}-exercise ${sizeLabel} built from your top gaps!`, 'success', '💪');
      }, [getSmartRecommendations, getMuscleGroupPriorities, getTotalRemaining, getSessionSize, showToast, getExercisesDoneThisWeek]);

      // Logging
      const logWorkout = useCallback((exercise, variant, sets) => {
        const newEntry = {
          exercise,
          variant,
          sets,
          date: new Date().toISOString(),
          id: Date.now()
        };
        
        // Check if this completes a muscle group
        const currentVolume = calculateCurrentWeekVolume();
        const ex = exerciseLibrary[exercise];
        if (ex) {
          Object.entries(ex.muscles).forEach(([muscle, multiplier]) => {
            if (allMuscles.includes(muscle)) {
              const newVolume = (currentVolume[muscle] || 0) + (sets * multiplier);
              const wasIncomplete = currentVolume[muscle] < medTarget;
              const nowComplete = newVolume >= medTarget;
              
              if (wasIncomplete && nowComplete) {
                triggerConfetti();
                showToast(`${muscle.charAt(0).toUpperCase() + muscle.slice(1)} target hit! 🎉`, 'celebration', '🎯');
              }
            }
          });
        }
        
        setWorkoutHistory(prev => [...prev, newEntry]);

        if (majorLifts[exercise]) {
          setLastStrengthWorkout(prev => ({
            ...prev,
            [exercise]: new Date().toISOString()
          }));
        }

        setLastUsedVariants(prev => ({
          ...prev,
          [exercise]: variant
        }));
        
        // Track session progress
        if (structuredSession) {
          setSessionProgress(prev => {
            const updated = { ...prev, [exercise]: true };
            
            // Check if all session exercises are complete
            const allExercises = [
              structuredSession.tier1?.exercise,
              structuredSession.tier2?.exercise,
              structuredSession.tier3?.exercise,
              structuredSession.tier4?.exercise,
              structuredSession.tier5?.exercise,
              structuredSession.tier6?.exercise
            ].filter(Boolean);
            
            const allComplete = allExercises.every(ex => updated[ex]);
            
            if (allComplete && !prev._celebrated) {
              // Trigger "As Rx'd!" celebration
              setTimeout(() => {
                triggerConfetti();
                triggerConfetti(); // Double confetti!
                showToast('Session Complete - As Rx\'d! 💪🔥', 'celebration', '🏆');
              }, 500);
              updated._celebrated = true;
            }
            
            return updated;
          });
        }
        
        showToast(`Logged ${sets} sets of ${variant}`, 'success', '✓');
        
        // Update personal bests
        const updatedVolume = { ...currentVolume };
        if (ex) {
          Object.entries(ex.muscles).forEach(([muscle, multiplier]) => {
            if (allMuscles.includes(muscle)) {
              updatedVolume[muscle] = (updatedVolume[muscle] || 0) + (sets * multiplier);
            }
          });
        }
        updatePersonalBests(updatedVolume);
        
        // Check for "almost done" muscles (1-2 sets away from MED target)
        setTimeout(() => {
           if (showAlmostDone) return;
          const almostDone = [];
          allMuscles.forEach(muscle => {
            const current = updatedVolume[muscle] || 0;
            const remaining = medTarget - current;
            
            if (remaining > 0 && remaining <= 2) {
              // Find quick ACCESSORY exercises that could complete this muscle (no big compounds!)
              const quickExercises = Object.entries(exerciseLibrary)
                .filter(([name, data]) => {
                  const muscleContribution = data.muscles[muscle] || 0;
                  // ONLY accessories - no heavy compound lifts for quick finishers
                  return muscleContribution >= 0.8 && data.category === 'accessory';
                })
                .map(([name, data]) => ({
                  exercise: name,
                  remaining: remaining,
                  muscle: muscle,
                  category: data.category,
                  variants: data.variants,
                  movementCategory: data.movementCategory
                }));
              
              if (quickExercises.length > 0) {
                almostDone.push({
                  muscle,
                  remaining: remaining.toFixed(1),
                  exercises: quickExercises.slice(0, 3) // Top 3 suggestions
                });
              }
            }
          });
          
          if (almostDone.length > 0) {
            setAlmostDoneSuggestions(almostDone);
            setShowAlmostDone(true);
          }
        }, 1000); // Small delay so confetti/toasts appear first
      }, [calculateCurrentWeekVolume, medTarget, showToast, updatePersonalBests, structuredSession, showAlmostDone]);

      // Derived
      const priorities = getMuscleGroupPriorities();
      const smartRecs = useMemo(() => getSmartRecommendations(), [getSmartRecommendations]);
      const currentWeekVolume = calculateCurrentWeekVolume();
      const stats = calculateStats();

      // Map muscle -> percentage for quick lookup
      const muscleProgress = {};
      priorities.forEach(p => {
        muscleProgress[p.muscle] = p.percentage;
      });

      const accessoryNeeds = priorities
        .filter(p => !p.isPrimary && p.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining)
        .slice(0, 3);

      // Group by movement category
      const movementKeys = ['pull', 'squat', 'press', 'posterior'];
      const categoryBuckets = {};
      movementKeys.forEach(k => (categoryBuckets[k] = { exercises: [], score: 0 }));

      smartRecs.forEach(rec => {
        const cat = rec.movementCategory;
        if (!movementKeys.includes(cat)) return;
        categoryBuckets[cat].exercises.push(rec);
        categoryBuckets[cat].score += parseFloat(rec.score || 0);
      });

      const sortedCategories = Object.entries(categoryBuckets)
        .filter(([, bucket]) => bucket.exercises.length > 0)
        .sort((a, b) => b[1].score - a[1].score);

      // Current week grade
      const currentWeekGrade = useMemo(() => {
        let totalPercentage = 0;
        let musclesHit = 0;
        
        muscleGroups.primary.forEach(muscle => {
          const volume = currentWeekVolume[muscle] || 0;
          const percentage = Math.min((volume / medTarget) * 100, 100); // Cap at 100
          totalPercentage += percentage;
          
          if (volume >= medTarget) {
            musclesHit++;
          }
        });
        
        const avgPercentage = totalPercentage / muscleGroups.primary.length;
        
        // Grade based on average percentage (with bonus for hitting targets)
        if (avgPercentage >= 100 || musclesHit === 6) {
          return { grade: 'S', color: 'from-purple-500 to-pink-500', label: 'Perfect!', avgPercentage, musclesHit };
        } else if (avgPercentage >= 80 || musclesHit >= 5) {
          return { grade: 'A', color: 'from-blue-500 to-cyan-500', label: 'Excellent', avgPercentage, musclesHit };
        } else if (avgPercentage >= 65 || musclesHit >= 4) {
          return { grade: 'B', color: 'from-green-500 to-emerald-500', label: 'Great', avgPercentage, musclesHit };
        } else if (avgPercentage >= 50 || musclesHit >= 3) {
          return { grade: 'C', color: 'from-yellow-500 to-orange-500', label: 'Good', avgPercentage, musclesHit };
        }
        return { grade: 'D', color: 'from-red-500 to-pink-500', label: 'Keep Going', avgPercentage, musclesHit };
      }, [currentWeekVolume, medTarget]);

      // Components
      const ProgressRing = ({ percentage, size = 60, strokeWidth = 6, muscle }) => {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const offset = circumference - (Math.min(percentage, 100) / 100) * circumference;
        
        let colorClass = 'text-red-500';
        if (percentage >= 100) colorClass = 'text-emerald-500';
        else if (percentage >= 75) colorClass = 'text-lime-500';
        else if (percentage >= 50) colorClass = 'text-amber-500';
        
        return (
          <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-slate-200"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={`${colorClass} transition-all duration-500`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[8px] font-bold text-slate-900 capitalize leading-tight text-center">
                {muscle.substring(0, 4)}
              </span>
              <span className={`text-[9px] font-bold ${colorClass}`}>
                {Math.round(percentage)}%
              </span>
            </div>
          </div>
        );
      };

      const ExerciseCard = ({ rec }) => {
        const isExpanded = !!expandedExercises[rec.exercise];

        // 60% chance to use last-used variant, 40% chance to randomize for variety
        const defaultVariant = useMemo(() => {
          const variants = rec.variants || [rec.exercise];
          
          // Check what was used this week for this exercise
          const thisWeekWorkouts = getCurrentWeekWorkouts();
          const thisWeekVariantsForExercise = thisWeekWorkouts
            .filter(w => w.exercise === rec.exercise)
            .map(w => w.variant);
          
          // If we have a preferred variant from history, use it 60% of the time
          const useLastUsed = Math.random() < 0.6;
          if (useLastUsed && lastUsedVariants[rec.exercise] && variants.includes(lastUsedVariants[rec.exercise])) {
            return lastUsedVariants[rec.exercise];
          }
          
          // Otherwise, try to rotate tool families
          if (thisWeekVariantsForExercise.length > 0) {
            const usedFamilies = new Set(thisWeekVariantsForExercise.map(v => getVariantFamily(v)));
            const unusedVariants = variants.filter(v => !usedFamilies.has(getVariantFamily(v)));
            
            if (unusedVariants.length > 0) {
              // Deterministic selection from unused families (seeded by week)
              const weekSeed = currentWeekStart.getTime() + rec.exercise.charCodeAt(0);
              const index = weekSeed % unusedVariants.length;
              return unusedVariants[index];
            }
          }
          
          // Fallback: deterministic selection (seeded by week)
          const weekSeed = currentWeekStart.getTime() + rec.exercise.charCodeAt(0);
          const index = weekSeed % variants.length;
          return variants[index];
        }, [rec.exercise, rec.variants, lastUsedVariants, getCurrentWeekWorkouts, currentWeekStart]);

        const selectedVariant = selectedVariants[rec.exercise] || defaultVariant;
        const sets = setSets[rec.exercise] || 3;

        const handleToggle = () => {
          if (!expandedExercises[rec.exercise] && !selectedVariants[rec.exercise]) {
            setSelectedVariants(prev => ({
              ...prev,
              [rec.exercise]: defaultVariant
            }));
          }

          setExpandedExercises(prev => {
            const isCurrentlyOpen = !!prev[rec.exercise];
            if (isCurrentlyOpen) {
              return {};
            }
            return { [rec.exercise]: true };
          });
        };

        const handleLog = () => {
          logWorkout(rec.exercise, selectedVariant, sets);
          setExpandedExercises({});
        };

        const hasScore = rec.score !== null && rec.score !== undefined;

        return (
          <div className={`card-hover rounded-xl overflow-hidden bg-white border transition-all duration-200 ${
            isExpanded 
              ? 'border-primary-400 shadow-lg ring-2 ring-primary-100' 
              : 'border-slate-200 shadow-sm'
          }`}>
            <button
              type="button"
              onClick={handleToggle}
              className={`w-full text-left px-4 py-3.5 flex flex-col gap-2 transition-colors ${
                isExpanded ? 'bg-gradient-to-r from-primary-50 to-indigo-50' : 'bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-slate-900 mb-1.5 tracking-tight">
                    {rec.exercise}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      rec.category === 'primary'
                        ? 'bg-gradient-to-r from-primary-500 to-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {rec.category === 'primary' ? 'Compound' : 'Accessory'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <span className="font-medium text-slate-700 capitalize">{rec.primaryMuscle}</span>
                    <span>•</span>
                    <span>Targets: {rec.targets?.join(', ') || rec.primaryMuscle}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  {hasScore && (
                    <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-primary-500 to-indigo-500 text-white badge-glow">
                      {rec.score}
                    </span>
                  )}
                  <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all duration-200 ${
                    isExpanded 
                      ? 'border-primary-400 bg-primary-50 text-primary-600 rotate-180' 
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="px-4 py-4 border-t-2 border-primary-100 bg-gradient-to-b from-slate-50 to-white space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Variation
                    </label>
                    <select
                      value={selectedVariant}
                      onChange={e =>
                        setSelectedVariants(prev => ({
                          ...prev,
                          [rec.exercise]: e.target.value
                        }))
                      }
                      className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white transition-all"
                    >
                      {rec.variants?.map(v => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-slate-700">
                      Sets
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSetSets(prev => ({
                            ...prev,
                            [rec.exercise]: Math.max(1, sets - 1)
                          }))
                        }
                        className="p-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                      >
                        <Minus className="text-slate-600" size={18} />
                      </button>
                      <span className="text-2xl font-bold min-w-[3rem] text-center text-slate-900">
                        {sets}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSetSets(prev => ({
                            ...prev,
                            [rec.exercise]: Math.min(10, sets + 1)
                          }))
                        }
                        className="p-2.5 border-2 border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
                      >
                        <Plus className="text-slate-600" size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLog}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all active:scale-98"
                >
                  <CheckCircle size={20} />
                  <span>Log {sets} sets of {selectedVariant}</span>
                </button>
              </div>
            )}
          </div>
        );
      };

      const CategoryCard = ({ catKey, bucket }) => {
        const meta = movementCategoryMeta[catKey];
        if (!meta) return null;

        const isExpanded = expandedCategories[catKey];
        const score = bucket.score.toFixed(1);
        const exercises = bucket.exercises.slice(0, 4);

        const relevantMuscles = [...meta.primaryMuscles, ...meta.accessoryMuscles];
        const muscleProgress = priorities.filter(p => relevantMuscles.includes(p.muscle));

        const minPct = muscleProgress.length
          ? Math.min(...muscleProgress.map(p => p.percentage))
          : 0;

        let borderColor = 'border-rose-400';
        if (minPct >= 100) {
          borderColor = 'border-emerald-500';
        } else if (minPct >= 75) {
          borderColor = 'border-lime-400';
        } else if (minPct >= 50) {
          borderColor = 'border-amber-400';
        }

        return (
          <div className={`card-hover rounded-xl overflow-hidden bg-white border ${borderColor} shadow-md`}>
            <button
              type="button"
              onClick={() =>
                setExpandedCategories(prev => ({ ...prev, [catKey]: !prev[catKey] }))
              }
              className={`w-full px-4 py-4 bg-gradient-to-r ${meta.gradient} text-white transition-all`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{meta.icon}</span>
                    <h3 className="text-base font-bold">{meta.label}</h3>
                  </div>
                  <p className="text-xs text-white/90 mb-1">{meta.subtitle}</p>
                  <p className="text-[11px] text-white/75 leading-relaxed">{meta.description}</p>
                  <p className="text-[10px] text-white/80 mt-1.5">
                    Weekly progress: {Math.round(minPct)}%
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white">
                    {score}
                  </span>
                  <div
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/10 border border-white/20 transition-all duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="category-expand">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    This Week&apos;s Progress
                  </h4>
                  <div className="space-y-2.5">
                    {muscleProgress.map(p => (
                      <div key={p.muscle} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="capitalize font-semibold text-slate-900">
                            {p.muscle} {!p.isPrimary && '(accessory)'}
                          </span>
                          <span
                            className={`font-bold ${
                              p.current >= medTarget ? 'text-emerald-600' : 'text-slate-600'
                            }`}
                          >
                            {p.current.toFixed(1)}/{medTarget}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className={`progress-bar h-2 rounded-full ${
                              p.isPrimary
                                ? p.percentage >= 100
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                  : p.percentage >= 60
                                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                  : 'bg-gradient-to-r from-red-400 to-pink-400'
                                : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                            }`}
                            style={{ width: `${Math.min(p.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    Recommended Exercises
                  </h4>
                  {exercises.map(rec => (
                    <ExerciseCard key={rec.exercise} rec={rec} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      };

      const WorkoutView = () => (
        <div className="space-y-5">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-indigo-600 to-purple-600"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative px-6 py-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                    Adaptive Priority Training
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-white/90 mb-3">
                    <Activity size={16} />
                    <span className="font-medium">This Week</span>
                  </div>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">
                    Chaos with guardrails: cover Press / Pull / Squat / Hip-Dominant across the week — everything else is flexible.
                  </p>
                  
                  {/* Streak display */}
                  {stats.currentStreak > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mt-3">
                      <span className="text-lg">🔥</span>
                      <span className="text-sm font-bold text-white">
                        {stats.currentStreak} week streak!
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => setCurrentView('settings')}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all active:scale-95"
                  >
                    <SettingsIcon className="text-white" size={20} />
                  </button>
                  
                  {/* Week grade badge */}
                  <div className={`px-4 py-2 rounded-xl bg-gradient-to-r ${currentWeekGrade.color} border-2 border-white/30 backdrop-blur-sm shadow-lg`}>
                    <div className="text-2xl font-black text-white text-center leading-none mb-0.5">
                      {currentWeekGrade.grade}
                    </div>
                    <div className="text-[9px] font-semibold text-white/90 text-center uppercase tracking-wide">
                      {currentWeekGrade.label}
                    </div>
                    {currentWeekGrade.avgPercentage !== undefined && (
                      <div className="text-[8px] font-bold text-white/80 text-center mt-0.5">
                        {Math.round(currentWeekGrade.avgPercentage)}% avg
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress rings */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {priorities.filter(p => p.isPrimary).map(p => (
                  <div key={p.muscle} className="flex-shrink-0">
                    <ProgressRing 
                      percentage={p.percentage} 
                      size={54}
                      strokeWidth={5}
                      muscle={p.muscle}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Start Card */}
          <div className="card-hover rounded-xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-emerald-200 shadow-md overflow-hidden">
            <button
              type="button"
              onClick={() => setShowQuickStart(!showQuickStart)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-white/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">🚀</span>
                <span className="text-sm font-bold text-emerald-900">
                  Quick Start Guide
                </span>
              </div>
              <div className={`transform transition-transform ${showQuickStart ? 'rotate-180' : ''}`}>
                <ChevronDown className="text-emerald-600" />
              </div>
            </button>
            
            {showQuickStart && (
              <div className="px-4 pb-4 pt-2 text-sm text-emerald-900 bg-white/40">
                <p className="text-emerald-800 mb-3 leading-relaxed">
                  Don't overthink it — the app adapts after 1–2 weeks of logs.
                </p>
                <ul className="space-y-2 text-emerald-800">
                  <li className="flex gap-2">
                    <span className="font-bold min-w-[70px]">Days:</span>
                    <span>Aim for 3–5 training days/week (or whenever you can)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-[70px]">Session:</span>
                    <span>2–4 exercises, 2–4 sets each</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-[70px]">Reps:</span>
                    <span>5–30 works. Compounds: 6–12. Accessories: 10–20.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-[70px]">Effort:</span>
                    <span>Higher weekly volume = leave 1–2 reps in reserve on big lifts</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-[70px]">Rotation:</span>
                    <span>Keep the pattern, rotate the tool (barbell → DB → machine → push-ups)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-[70px]">Builder:</span>
                    <span>Hit "Build Session" to auto-generate 3–4 exercises from your gaps (first week might repeat — it's learning your patterns!)</span>
                  </li>
                </ul>
                <div className="text-xs text-emerald-700 italic border-t border-emerald-200 pt-3 mt-3">
                  💡 Goal: cover Press / Pull / Squat / Hip-Dominant across the week — everything else is flexible.
                </div>
              </div>
            )}
          </div>

          {/* Structured session */}
          {structuredSession && (
            <div className="card-hover rounded-xl overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-300 shadow-lg">
              <div className="px-5 py-4 border-b border-indigo-200 bg-white/50 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-indigo-900 mb-1">
                      {structuredSession.lift} Session
                    </h3>
                    <p className="text-sm text-indigo-700">
                      Built from your top priorities—ready to crush it! 💪
                    </p>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-indigo-700 mb-1">
                    <span className="font-semibold">Progress</span>
                    <span>
                      {Object.entries(sessionProgress).filter(([k, v]) => v === true && !k.startsWith('_')).length}/
                      {[structuredSession.tier1, structuredSession.tier2, structuredSession.tier3, structuredSession.tier4].filter(Boolean).length} exercises
                    </span>
                  </div>
                  <div className="w-full bg-indigo-100 rounded-full h-2">
                    <div
                      className="progress-bar h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                      style={{
                        width: `${(Object.entries(sessionProgress).filter(([k, v]) => v === true && !k.startsWith('_')).length / 
                          [structuredSession.tier1, structuredSession.tier2, structuredSession.tier3, structuredSession.tier4].filter(Boolean).length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                {structuredSession.tier1 && (
                  <div className="relative">
                    {sessionProgress[structuredSession.tier1.exercise] && (
                      <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <ExerciseCard rec={structuredSession.tier1} />
                  </div>
                )}
                {structuredSession.tier2 && (
                  <div className="relative">
                    {sessionProgress[structuredSession.tier2.exercise] && (
                      <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <ExerciseCard rec={structuredSession.tier2} />
                  </div>
                )}
                {structuredSession.tier3 && (
                  <div className="relative">
                    {sessionProgress[structuredSession.tier3.exercise] && (
                      <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <ExerciseCard rec={structuredSession.tier3} />
                  </div>
                )}
                {structuredSession.tier4 && (
                  <div className="relative">
                    {sessionProgress[structuredSession.tier4.exercise] && (
                      <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <ExerciseCard rec={structuredSession.tier4} />
                  </div>
                )}
                {structuredSession.tier5 && (
                  <div className="relative">
                    {sessionProgress[structuredSession.tier5.exercise] && (
                      <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <ExerciseCard rec={structuredSession.tier5} />
                  </div>
                )}
                {structuredSession.tier6 && (
                  <div className="relative">
                    {sessionProgress[structuredSession.tier6.exercise] && (
                      <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white rounded-full p-1 shadow-lg">
                        <CheckCircle size={20} />
                      </div>
                    )}
                    <ExerciseCard rec={structuredSession.tier6} />
                  </div>
                )}
              </div>
              
              <div className="px-4 pb-4">
                <button
                  onClick={() => {
                    setStructuredSession(null);
                    setSessionProgress({});
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm transition-all active:scale-98 shadow-md"
                >
                  {sessionProgress._celebrated ? '🏆 Session Complete - Close' : 'Finish Session'}
                </button>
              </div>
            </div>
          )}

          {/* Weekly at-a-glance strip */}
          <div className="bg-white rounded-lg shadow p-3">
            <h3 className="text-[11px] font-bold text-gray-900 mb-2">
              Weekly Checkpoint
            </h3>
            <div className="flex flex-wrap gap-2">
              {priorities
                .filter(p => p.isPrimary)
                .map(p => {
                  let bg = 'bg-rose-500';
                  if (p.percentage >= 100) bg = 'bg-emerald-500';
                  else if (p.percentage >= 75) bg = 'bg-lime-500';
                  else if (p.percentage >= 50) bg = 'bg-amber-500';

                  return (
                    <div
                      key={p.muscle}
                      className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-gray-100"
                    >
                      <span className={`w-2 h-2 rounded-full ${bg}`} />
                      <span className="capitalize">{p.muscle}</span>
                      <span className="text-gray-600">
                        {p.current.toFixed(1)}/{medTarget}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Finish Week Button - show when close to completion */}
          {(() => {
            const setsNeededToFinish = priorities
              .filter(p => p.isPrimary && p.remaining > 0)
              .reduce((sum, p) => sum + p.remaining, 0);
            
            const incompleteMuscles = priorities.filter(p => p.isPrimary && p.remaining > 0).length;
            
            if (setsNeededToFinish > 0 && setsNeededToFinish <= 8 && incompleteMuscles <= 3) {
              return (
                <button
                  onClick={() => {
                    const suggestions = [];
                    
                    priorities
                      .filter(p => p.isPrimary && p.remaining > 0)
                      .forEach(p => {
                        const quickExercises = Object.entries(exerciseLibrary)
                          .filter(([name, data]) => {
                            const muscleContribution = data.muscles[p.muscle] || 0;
                            return muscleContribution >= 0.8 && data.category === 'accessory';
                          })
                          .map(([name, data]) => ({
                            exercise: name,
                            remaining: p.remaining,
                            muscle: p.muscle,
                            category: data.category,
                            variants: data.variants,
                            movementCategory: data.movementCategory
                          }));
                        
                        if (quickExercises.length > 0) {
                          suggestions.push({
                            muscle: p.muscle,
                            remaining: p.remaining.toFixed(1),
                            exercises: quickExercises.slice(0, 3)
                          });
                        }
                      });
                    
                    setAlmostDoneSuggestions(suggestions);
                    setShowAlmostDone(true);
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">🎯</span>
                  <span>Finish Week ({Math.ceil(setsNeededToFinish)} sets)</span>
                  <span className="text-2xl">💪</span>
                </button>
              );
            }
            return null;
          })()}

          {/* Main priorities */}
          {!structuredSession && (
            <>
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-primary-100">
                      <TrendingUp className="text-primary-600" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Today's Priorities
                    </h2>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Movement categories ranked by weekly need. These suggestions adapt based on what you've already done this week.
                  </p>
                </div>

                {accessoryNeeds.length > 0 && (
                  <div className="px-5 py-3 bg-amber-50 border-b border-amber-100">
                    <p className="text-sm text-amber-900 leading-relaxed">
                      <span className="font-semibold">🎯 Accessory gaps: </span>
                      {accessoryNeeds.map((p, i) => (
                        <span key={p.muscle}>
                          {i > 0 && ', '}
                          <span className="capitalize font-medium">{p.muscle}</span>
                          <span className="text-amber-700"> ({p.remaining.toFixed(1)} sets)</span>
                        </span>
                      ))}
                    </p>
                  </div>
                )}

                <div className="p-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={buildPrioritySessionFromTopRecs}
                      className="w-full btn-primary text-white px-4 py-3.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 active:scale-98 mb-4"
                    >
                      <Zap size={20} />
                      <span>Build Session from Top Priorities</span>
                    </button>
                    
                    {showBuilderTooltip && (
                      <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="text-lg mt-0.5">💡</span>
                          <div className="flex-1">
                            <p className="text-sm text-blue-900 leading-relaxed">
                              <strong>Auto-builds a balanced workout</strong> from your weekly gaps (3–4 exercises). 
                              First week might repeat — it's learning your patterns!
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setShowBuilderTooltip(false);
                              localStorage.setItem('medApp_builderTooltipDismissed', 'true');
                            }}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-xs px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                          >
                            Got it
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {sortedCategories.map(([catKey, bucket]) => (
                      <CategoryCard
                        key={catKey}
                        catKey={catKey}
                        bucket={bucket}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuickAdd(true)}
                    className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-bold hover:from-blue-600 hover:to-cyan-600 shadow-md transition-all active:scale-98"
                  >
                    <Plus size={20} />
                    <span>Add Accessory Exercise</span>
                  </button>
                  
                  {/* Bonus Exercises Section */}
                  <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">🎁</span>
                      <div>
                        <h3 className="text-sm font-bold text-orange-900">Optional Finishers</h3>
                        <p className="text-xs text-orange-800 mt-1 leading-relaxed">
                          Great for extra core, grip, or conditioning — no weekly minimum required.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-orange-700 bg-white/60 rounded-lg p-2">
                        <strong>Loaded Carries</strong> — Farmers walks, suitcase carries, overhead walks
                      </div>
                      <div className="text-xs text-orange-700 bg-white/60 rounded-lg p-2">
                        <strong>Conditioning</strong> — Burpees, battle ropes, sled work
                      </div>
                      <div className="text-xs text-orange-700 bg-white/60 rounded-lg p-2">
                        <strong>Mobility</strong> — Stretching, yoga, foam rolling
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      );

      const ArchiveView = () => {
        const sorted = [...workoutHistory].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        
        const avgWorkoutsPerWeek = weeklyVolumes.length > 0
          ? (workoutHistory.length / weeklyVolumes.length).toFixed(1)
          : 0;
        
        return (
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800"></div>
              <div className="relative px-6 py-8">
                <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                  Workout Archive
                </h1>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <ArchiveIcon size={16} />
                  <span className="font-medium">{sorted.length} total workouts logged</span>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-3xl font-black text-primary-600 mb-1">
                  {stats.totalWorkouts}
                </div>
                <div className="text-xs font-semibold text-slate-600">Total Workouts</div>
              </div>
              
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-3xl font-black text-emerald-600 mb-1">
                  {stats.totalSets}
                </div>
                <div className="text-xs font-semibold text-slate-600">Total Sets</div>
              </div>
              
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-3xl font-black text-purple-600 mb-1">
                  {stats.currentStreak}
                </div>
                <div className="text-xs font-semibold text-slate-600">Week Streak</div>
              </div>
              
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md p-4">
                <div className="text-3xl font-black text-orange-600 mb-1">
                  {avgWorkoutsPerWeek}
                </div>
                <div className="text-xs font-semibold text-slate-600">Workouts/Week</div>
              </div>
            </div>

            {/* Personal Bests */}
            {Object.keys(personalBests).length > 0 && (
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏆</span>
                    <h2 className="text-lg font-bold text-slate-900">Personal Bests</h2>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Highest weekly volume per muscle</p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                  {Object.entries(personalBests)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 6)
                    .map(([muscle, volume]) => (
                      <div key={muscle} className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="text-xs font-semibold text-slate-600 capitalize mb-1">
                          {muscle}
                        </div>
                        <div className="text-xl font-black text-orange-600">
                          {volume.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-slate-500">sets/week</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-2">
                  <Award className="text-purple-600" size={20} />
                  <h2 className="text-lg font-bold text-slate-900">Achievements</h2>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {Object.keys(achievements).length} of {Object.keys(achievementDefinitions).length} unlocked
                </p>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {Object.entries(achievementDefinitions).map(([key, def]) => {
                  const unlocked = achievements[key];
                  return (
                    <div
                      key={key}
                      className={`text-center p-3 rounded-lg border-2 transition-all ${
                        unlocked
                          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 achievement-unlock'
                          : 'bg-slate-50 border-slate-200 opacity-50'
                      }`}
                    >
                      <div className="text-3xl mb-1">{def.icon}</div>
                      <div className="text-[10px] font-bold text-slate-900 leading-tight">
                        {def.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
              </div>
              <div className="p-4">
                {sorted.length === 0 && (
                  <div className="text-center py-12">
                    <ArchiveIcon className="mx-auto mb-3 text-slate-300" size={48} />
                    <p className="text-slate-600 text-sm">No workouts logged yet</p>
                  </div>
                )}
                <div className="space-y-2">
                  {sorted.slice(0, 10).map(w => {
                    const d = new Date(w.date);
                    return (
                      <div
                        key={w.id}
                        className="card-hover border border-slate-200 rounded-lg px-4 py-3 bg-slate-50"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-bold text-slate-900">{w.exercise}</span>
                          <span className="text-xs text-slate-500">
                            {d.toLocaleDateString()}{' '}
                            {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700">
                          <span className="font-semibold text-primary-600">{w.sets} sets</span> • {w.variant}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      };

      const TrendsView = () => {
        const mesocycleAvg = getMesocycleAverage();
        
        return (
          <div className="space-y-5">
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600"></div>
              <div className="relative px-6 py-8">
                <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                  Mesocycle Trends
                </h1>
                <div className="flex items-center gap-2 text-sm text-white/90">
                  <Activity size={16} />
                  <span className="font-medium">{weeklyVolumes.length} weeks of data</span>
                </div>
              </div>
            </div>

            {/* 6-Week Averages */}
            <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  6-Week Mesocycle Averages
                </h2>
                <p className="text-sm text-slate-600">
                  Chronic deficit = &lt; {(medTarget * 0.8).toFixed(0)} sets/week average
                </p>
              </div>
              
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Primary Compounds
                  </h3>
                  {priorities.filter(p => p.isPrimary).map(p => {
                    const avg = mesocycleAvg[p.muscle] || 0;
                    const isChronicDeficit = avg < (medTarget * 0.8);
                    const percentage = (avg / medTarget) * 100;
                    
                    return (
                      <div key={p.muscle} className={`mb-3 p-3 rounded-lg border-2 ${
                        isChronicDeficit ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-bold capitalize ${
                            isChronicDeficit ? 'text-rose-700' : 'text-slate-800'
                          }`}>
                            {p.muscle}
                            {isChronicDeficit && ' ⚠️'}
                          </span>
                          <span className={`text-lg font-bold ${
                            isChronicDeficit ? 'text-rose-600' :
                            avg >= medTarget ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {avg.toFixed(1)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                          <div
                            className={`progress-bar h-2 rounded-full ${
                              isChronicDeficit ? 'bg-gradient-to-r from-rose-500 to-red-500' :
                              percentage >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 
                              'bg-gradient-to-r from-amber-500 to-orange-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>6-week average</span>
                          <span>{percentage.toFixed(0)}% of target</span>
                        </div>
                        
                        {isChronicDeficit && (
                          <div className="mt-2 text-xs text-rose-700 font-medium">
                            ⚠️ CHRONIC DEFICIT - Prioritize this muscle!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Accessories
                  </h3>
                  {priorities.filter(p => !p.isPrimary).map(p => {
                    const avg = mesocycleAvg[p.muscle] || 0;
                    const percentage = (avg / medTarget) * 100;
                    
                    return (
                      <div key={p.muscle} className="mb-3 p-3 rounded-lg border-2 bg-blue-50 border-blue-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold capitalize text-blue-800">
                            {p.muscle}
                          </span>
                          <span className={`text-lg font-bold ${
                            avg >= medTarget ? 'text-emerald-600' : 'text-blue-600'
                          }`}>
                            {avg.toFixed(1)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-blue-100 rounded-full h-2 mb-2">
                          <div
                            className={`progress-bar h-2 rounded-full ${
                              percentage >= 100 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 
                              'bg-gradient-to-r from-blue-400 to-cyan-400'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-blue-700">
                          <span>6-week average</span>
                          <span>{percentage.toFixed(0)}% of target</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Week-by-Week History */}
            {weeklyVolumes.length > 0 && (
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900">Week-by-Week Progress</h2>
                </div>
                
                <div className="p-4 space-y-3">
                  {weeklyVolumes.map((week, index) => {
                    const weekDate = new Date(week.weekStart);
                    const isCurrentWeek = weekDate.getTime() === currentWeekStart.getTime();
                    const weeksAgo = weeklyVolumes.length - index - 1;
                    
                    return (
                      <div key={week.weekStart} className={`p-4 rounded-lg border-2 ${
                        isCurrentWeek ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-bold text-slate-800">
                              {isCurrentWeek ? 'Current Week' : `${weeksAgo} week${weeksAgo === 1 ? '' : 's'} ago`}
                            </div>
                            <div className="text-xs text-slate-500">
                              {weekDate.toLocaleDateString()}
                            </div>
                          </div>
                          {week.grade && (
                            <div className="text-right">
                              <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${week.grade.color} text-white text-sm font-bold mb-1`}>
                                {week.grade.grade}
                              </div>
                              {week.avgPercentage !== undefined && (
                                <div className="text-xs text-slate-500">
                                  {Math.round(week.avgPercentage)}% avg
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          {muscleGroups.primary.map(muscle => {
                            const volume = week.volumes[muscle] || 0;
                            const metTarget = volume >= medTarget;
                            
                            return (
                              <div key={muscle} className="text-center p-2 bg-white rounded border border-slate-200">
                                <div className="text-xs capitalize text-slate-600 mb-1">{muscle}</div>
                                <div className={`font-bold text-sm ${metTarget ? 'text-emerald-600' : 'text-slate-400'}`}>
                                  {volume.toFixed(1)}
                                  {metTarget && ' ✓'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {weeklyVolumes.length === 0 && (
              <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md p-12 text-center">
                <Activity className="mx-auto mb-3 text-slate-300" size={48} />
                <h3 className="text-lg font-bold text-slate-700 mb-2">No Trend Data Yet</h3>
                <p className="text-sm text-slate-600">
                  Start logging workouts to see your mesocycle trends and identify chronic deficits.
                </p>
              </div>
            )}
          </div>
        );
      };

      const APP_VERSION = '1.0.0';

      const SettingsView = () => (
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900"></div>
            <div className="relative px-6 py-8">
              <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                Settings
              </h1>
              <p className="text-sm text-white/80">
                Customize your training targets
              </p>
              <p className="mt-1 text-xs text-white/50">
                Version {APP_VERSION}
              </p>
            </div>
          </div>


          {/* How Does This Work? - Comprehensive FAQ */}
          <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
                <span className="text-xl">💡</span>
                How Does This Work?
              </h2>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div>
                <p className="font-semibold text-slate-900 mb-1">What split should I do?</p>
                <p className="text-slate-700 leading-relaxed">
                  Any split you want — this isn't a program, it's an adaptive system. Your only "job" is to hit
                  your weekly set targets. There are three easy ways to run it:
                </p>
                <ul className="mt-2 space-y-1.5 text-slate-700 leading-relaxed ml-4 list-disc">
                  <li>
                    <strong>Follow the priorities:</strong> on the main page, open the categories and pick the <strong>higher numbers</strong> first
                    (the stuff you're most behind on this week).
                  </li>
                  <li>
                    <strong>Use the Session Builder:</strong> on the main page, hit <strong>Build Session</strong> and it'll auto-pick 3–4 exercises that
                    close your gaps.
                  </li>
                  <li>
                    <strong>Do your usual split:</strong> log what you normally do for a week or two and the recommendations will
                    normalize around your real patterns.
                  </li>
                </ul>
                <p className="text-slate-700 leading-relaxed mt-2">
                  Full body, upper/lower, PPL, random — it all works. The app adapts to what you actually do.
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-slate-900 mb-1">Do I have to do the recommended exercises?</p>
                <p className="text-slate-700 leading-relaxed">
                  Nope. Recommendations are just the easiest way to close your weekly gaps. Keep the pattern,
                  pick the exercise you want — use the dropdown to swap to something you prefer.
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-slate-900 mb-1">What are the movement patterns?</p>
                <p className="text-slate-700 leading-relaxed">
                  Four buckets cover basically everything:
                  <strong> Press</strong> (chest/shoulders), <strong>Pull</strong> (back),
                  <strong> Squat / Single-Leg</strong> (quads), and <strong>Hip-Dominant</strong> (glutes/hamstrings).
                  If you cover these across the week, you're on track.
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-slate-900 mb-1">Exercise rotation</p>
                <p className="text-slate-700 leading-relaxed mb-2">
                  Keep training fun: <strong>keep the pattern, change the tool</strong> (barbell → dumbbell →
                  machine → bodyweight). A simple rule: go heavier earlier in the week, then use easier
                  variations later to get your sets in without grinding.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Example: if you benched heavy Monday, do machine press, push-ups, or incline dumbbells later.
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-slate-900 mb-1">How many reps should I do?</p>
                <p className="text-slate-700 leading-relaxed mb-2">
                  Whatever lets you accumulate quality sets. The app tracks sets, not reps.
                </p>
                <div className="space-y-2 ml-3">
                  <div>
                    <span className="font-medium text-slate-900">• 5-8 reps (heavy):</span>
                    <span className="text-slate-600"> Great for strength, more fatiguing</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">• 8-12 reps (moderate):</span>
                    <span className="text-slate-600"> Classic hypertrophy range</span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-900">• 12-20+ reps (light):</span>
                    <span className="text-slate-600"> Easier on joints, great for accessories</span>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed mt-2">
                  Research shows muscle growth is similar across rep ranges when sets are taken close to failure 
                  (Schoenfeld et al., 2021). Pick what fits your session and equipment.
                </p>
                <p className="text-slate-600 text-xs italic mt-2">
                  Early week: Heavier (5-8 reps) when fresh • Late week: Lighter (12-20 reps) to get sets in without grinding
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-slate-900 mb-1">How long should I rest?</p>
                <p className="text-slate-700 leading-relaxed">
                  Rest as long as you need to perform the next set well. Heavier, more demanding lifts
                  generally need longer rest; lighter or isolation work usually needs less.
                </p>
                <p className="text-slate-700 leading-relaxed mt-1">
                  There's no prize for rushing — good sets matter more than the clock.
                </p>
              </div>
              
              <div>
                <p className="font-semibold text-slate-900 mb-1">Why do recommendations change?</p>
                <p className="text-slate-700 leading-relaxed">
                  The app tracks what you've done this week and surfaces what's still missing. Early in the
                  week it may feel "pushy" — later it gets more specific. You can follow it, generate a
                  session, or ignore it entirely.
                </p>
              </div>
              
              <div className="pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed mb-2">
                  <strong className="text-slate-900">💪 Chaos with Guardrails</strong> — daily flexibility with weekly balance. 
                  Hit your volume targets however you want, then get on with your life.
                </p>
                <div className="text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">Research backing this approach:</p>
                  <p>• Volume targets: Schoenfeld et al. (2017) - "Dose-response relationship between weekly set volume and muscle mass"</p>
                  <p>• Rep ranges: Schoenfeld et al. (2021) - "Hypertrophic effects across rep ranges when taken close to failure"</p>
                  <p>• Minimum effective dose: Helms et al. (2018) - "Evidence-based recommendations for natural bodybuilding"</p>
                  <p>• Motor pattern retention: Schmidt & Lee (2011) - "Motor Control and Learning"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card-hover rounded-xl bg-white border border-slate-200 shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">How many sets do I need?</h2>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose your <strong>weekly volume target</strong> per muscle group — how many sets per week you'll aim for.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setMedTarget(5)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    medTarget === 5 
                      ? 'border-blue-500 bg-blue-50 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-lg text-slate-900">Maintenance</div>
                    <div className="font-black text-xl text-blue-600">5 sets</div>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Minimum Effective Dose (MED) — maintain muscle with minimal time
                  </div>
                </button>

                <button
                  onClick={() => setMedTarget(10)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    medTarget === 10 
                      ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-lg text-slate-900">Growth (Recommended)</div>
                    <div className="font-black text-xl text-emerald-600">10 sets</div>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Optimal for most people (research-backed sweet spot)
                  </div>
                </button>

                <button
                  onClick={() => setMedTarget(15)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    medTarget === 15 
                      ? 'border-purple-500 bg-purple-50 shadow-md' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-lg text-slate-900">Advanced Volume</div>
                    <div className="font-black text-xl text-purple-600">15 sets</div>
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Maximum adaptive volume for experienced lifters
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card-hover rounded-xl bg-white border border-slate-200 shadow overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Data Management
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <button
                onClick={() => {
                  const data = {
                    workoutHistory,
                    medTarget,
                    lastStrengthWorkout,
                    personalBests,
                    achievements,
                    lastUsedVariants,
                    mesocycleStart: mesocycleStart.toISOString(),
                    exportDate: new Date().toISOString(),
                    version: '1.0'
                  };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `med-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Data exported successfully!', 'success', '💾');
                }}
                className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-700 font-semibold hover:bg-blue-100 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">💾</span>
                <span>Export My Data</span>
              </button>
              
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target.result);
                        
                        if (data.workoutHistory) setWorkoutHistory(data.workoutHistory);
                        if (data.medTarget) setMedTarget(data.medTarget);
                        if (data.lastStrengthWorkout) setLastStrengthWorkout(data.lastStrengthWorkout);
                        if (data.personalBests) setPersonalBests(data.personalBests);
                        if (data.achievements) setAchievements(data.achievements);
                        if (data.lastUsedVariants) setLastUsedVariants(data.lastUsedVariants);
                        
                        showToast('Data imported successfully!', 'success', '✅');
                        setTimeout(() => setCurrentView('workout'), 1000);
                      } catch (error) {
                        showToast('Import failed - invalid file format', 'error', '❌');
                      }
                    };
                    reader.readAsText(file);
                  };
                  input.click();
                }}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-100 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg">📁</span>
                <span>Import Data</span>
              </button>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <span className="text-base">🔒</span>
                  <div>
                    <p className="font-semibold text-slate-700 mb-1">Your Privacy Matters</p>
                    <p>All your data stays on your device. Nothing is sent to any server. Export your data anytime for backup.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentView('workout')}
            className="w-full btn-primary text-white px-4 py-3.5 rounded-xl text-sm font-bold shadow-md flex items-center justify-center gap-2 active:scale-98"
          >
            <CheckCircle size={20} />
            <span>Save & Return to Workout</span>
          </button>
        </div>
      );

      const BottomNav = () => (
        <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-slate-200 shadow-2xl z-50">
          <div className="max-w-2xl mx-auto px-2 py-3 flex justify-around">
            <button
              onClick={() => setCurrentView('workout')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentView === 'workout'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <TrendingUp size={22} />
              <span className="text-xs font-semibold">Workout</span>
            </button>
            <button
              onClick={() => setCurrentView('archive')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentView === 'archive'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ArchiveIcon size={22} />
              <span className="text-xs font-semibold">Archive</span>
            </button>
            <button
              onClick={() => setCurrentView('trends')}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                currentView === 'trends'
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Activity size={22} />
              <span className="text-xs font-semibold">Trends</span>
            </button>
          </div>
        </div>
      );

      const QuickAddModal = () => {
        if (!showQuickAdd) return null;

        const accessoryExercises = Object.entries(exerciseLibrary)
          .filter(([_, data]) => data.category === 'accessory')
          .map(([name, data]) => ({ name, isBonus: data.isBonus }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const selectedData = quickAddExercise
          ? exerciseLibrary[quickAddExercise]
          : null;
        const variants = selectedData?.variants || [];
        const defaultVar =
          quickAddExercise &&
          lastUsedVariants[quickAddExercise] &&
          variants.includes(lastUsedVariants[quickAddExercise])
            ? lastUsedVariants[quickAddExercise]
            : variants[0] || '';

        const effectiveVariant = quickAddVariant || defaultVar;

        return (
          <div className="fixed inset-0 bg-black/50 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 px-5 py-4 border-b border-slate-200 bg-white z-10 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-900">Add Accessory</h3>
                  <button
                    onClick={() => {
                      setShowQuickAdd(false);
                      setQuickAddExercise('');
                      setQuickAddVariant('');
                      setQuickAddSets(3);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Exercise
                  </label>
                  <select
                    value={quickAddExercise}
                    onChange={e => {
                      const value = e.target.value;
                      setQuickAddExercise(value);
                      if (value) {
                        const ex = exerciseLibrary[value];
                        const v = ex.variants || [];
                        const autoVar =
                          lastUsedVariants[value] && v.includes(lastUsedVariants[value])
                            ? lastUsedVariants[value]
                            : v[0] || '';
                        setQuickAddVariant(autoVar);
                      } else {
                        setQuickAddVariant('');
                      }
                    }}
                    className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white transition-all"
                  >
                    <option value="">Select an accessory...</option>
                    {accessoryExercises.map(({ name, isBonus }) => (
                      <option key={name} value={name}>
                        {name}{isBonus ? ' 🎁 (bonus)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {quickAddExercise && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Variation
                      </label>
                      <select
                        value={effectiveVariant}
                        onChange={e => setQuickAddVariant(e.target.value)}
                        className="w-full border-2 border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 bg-white transition-all"
                      >
                        {variants.map(v => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Sets
                      </label>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={() => setQuickAddSets(s => Math.max(1, s - 1))}
                          className="p-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
                        >
                          <Minus className="text-slate-600" size={20} />
                        </button>
                        <span className="text-3xl font-bold min-w-[4rem] text-center text-slate-900">
                          {quickAddSets}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickAddSets(s => Math.min(10, s + 1))}
                          className="p-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95"
                        >
                          <Plus className="text-slate-600" size={20} />
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!quickAddExercise || !effectiveVariant) return;
                        logWorkout(quickAddExercise, effectiveVariant, quickAddSets);
                        setShowQuickAdd(false);
                        setQuickAddExercise('');
                        setQuickAddVariant('');
                        setQuickAddSets(3);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md transition-all active:scale-98"
                    >
                      <CheckCircle size={20} />
                      <span>Log {quickAddSets} sets of {effectiveVariant}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      };

      const AlmostDoneModal = () => {
        if (!showAlmostDone) return null;

        const handleQuickFinish = (suggestion, exercise) => {
          const setsNeeded = Math.ceil(parseFloat(suggestion.remaining));
          const variant = exercise.variants[0];
          
          logWorkout(exercise.exercise, variant, setsNeeded);
          setShowAlmostDone(false);
          setAlmostDoneSuggestions([]);
        };

        
        return (
          <div className="fixed inset-0 bg-black/50 modal-overlay flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl border-2 border-orange-300">
              <div className="sticky top-0 px-5 py-4 border-b border-orange-200 bg-white/80 backdrop-blur-sm z-10 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <h3 className="text-lg font-bold text-orange-900">Almost There!</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAlmostDone(false);
                      setAlmostDoneSuggestions([]);
                    }}
                    className="text-orange-400 hover:text-orange-600 font-bold text-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm text-orange-900 leading-relaxed">
                  You're super close to hitting your weekly targets! Want to finish strong? 💪
                </p>
                                             
                {almostDoneSuggestions.map(suggestion => (
                  <div key={suggestion.muscle} className="bg-white rounded-xl p-4 border-2 border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 capitalize text-base">
                          {suggestion.muscle}
                        </h4>
                        <p className="text-xs text-orange-700 font-medium">
                          Just {suggestion.remaining} sets away!
                        </p>
                      </div>
                      <div className="text-2xl">
                        {suggestion.remaining === '1.0' ? '🔥' : '⚡'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Quick finishers:</p>
                      {suggestion.exercises.map(ex => (
                        <button
                          key={ex.exercise}
                          onClick={() => handleQuickFinish(suggestion, ex)}
                          className="w-full text-left px-3 py-2.5 bg-gradient-to-r from-orange-100 to-yellow-100 hover:from-orange-200 hover:to-yellow-200 rounded-lg border border-orange-200 transition-all active:scale-98"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-900">
                              {ex.exercise}
                            </span>
                            <span className="text-xs font-bold text-orange-600">
                              {Math.ceil(parseFloat(suggestion.remaining))} set{Math.ceil(parseFloat(suggestion.remaining)) > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            {ex.variants[0]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    setShowAlmostDone(false);
                    setAlmostDoneSuggestions([]);
                  }}
                  className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition-all"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        );
      };

      const Toast = ({ toast }) => {
        const bgColor = toast.type === 'achievement' 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
          : toast.type === 'celebration'
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500';
        
        return (
          <div className={`toast flex items-center gap-3 ${bgColor} text-white px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm border border-white/20`}>
            <span className="text-2xl">{toast.icon}</span>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        );
      };

      // First Load Modal
      const FirstLoadModal = () => {
        if (!showFirstLoadModal) return null;
        
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 px-6 py-8 text-center">
                <div className="text-5xl mb-3">💪</div>
                <h2 className="text-2xl font-black text-white mb-2">
                  Adaptive Priority Training
                </h2>
                <p className="text-white/90 text-sm leading-relaxed">
                  Chaos with guardrails: flexible workouts, weekly balance
                </p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Quick Start</h3>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc pl-5">
                    <li>Train 3–5 days per week (or whenever you can)</li>
                    <li>Pick 2–4 exercises per session, 2–4 sets each</li>
                    <li>Cover Press / Pull / Squat / Hip-Dominant across the week</li>
                  </ul>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-bold text-slate-900 mb-3">Choose Your Weekly Target</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Sets per muscle group per week (you can change this later)
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMedTarget(5);
                        localStorage.setItem('medApp_hasSeenOnboarding', 'true');
                        setShowFirstLoadModal(false);
                        setShowQuickStart(true); // Auto-open Quick Start after onboarding
                      }}
                      className="w-full text-left p-3 rounded-lg border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">Maintenance</div>
                          <div className="text-xs text-slate-600">Busy schedule</div>
                        </div>
                        <div className="font-black text-blue-600 text-lg">5 sets</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setMedTarget(10);
                        localStorage.setItem('medApp_hasSeenOnboarding', 'true');
                        setShowFirstLoadModal(false);
                        setShowQuickStart(true);
                      }}
                      className="w-full text-left p-3 rounded-lg border-2 border-emerald-400 bg-emerald-50 hover:border-emerald-500 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">Growth ⭐</div>
                          <div className="text-xs text-slate-600">Recommended</div>
                        </div>
                        <div className="font-black text-emerald-600 text-lg">10 sets</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setMedTarget(15);
                        localStorage.setItem('medApp_hasSeenOnboarding', 'true');
                        setShowFirstLoadModal(false);
                        setShowQuickStart(true);
                      }}
                      className="w-full text-left p-3 rounded-lg border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900">Advanced</div>
                          <div className="text-xs text-slate-600">Experienced lifter</div>
                        </div>
                        <div className="font-black text-purple-600 text-lg">15 sets</div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <p className="text-xs text-slate-500 italic text-center pt-2">
                  💡 The app learns your patterns and adapts recommendations as you log workouts
                </p>
              </div>
            </div>
          </div>
        );
      };

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-24">
          <div className="max-w-2xl mx-auto px-4 py-6">
            {currentView === 'workout' && <WorkoutView />}
            {currentView === 'archive' && <ArchiveView />}
            {currentView === 'trends' && <TrendsView />}
            {currentView === 'settings' && <SettingsView />}
          </div>
          <BottomNav />
          <QuickAddModal />
          <AlmostDoneModal />
          <FirstLoadModal />
          
          {/* Toast container */}
          <div className="fixed top-4 right-4 z-[100] space-y-2">
            {toasts.map(toast => (
              <Toast key={toast.id} toast={toast} />
            ))}
          </div>
        </div>
      );
    };

   
   const root = ReactDOM.createRoot(document.getElementById('app'));
   root.render(<App />);