/*
 * PHASE 3A CONTENT LIBRARY
 * Replace visual placeholders with your own clean stills or muted MP4/WebM clips.
 * One content record powers the homepage card and its detail dialog.
 */
window.PORTFOLIO_DATA = {
  brand: 'Jaydn Nickie',
  brandLogo: 'assets/Asset 1@3x-8.png',
  contactEmail: 'jaydn_nickie@hotmail.com', // Public professional contact address.
  artstation: 'https://www.artstation.com/lyric12732',
  sylverSoulFeature: { video: 'assets/Fafniir_Throne_shot.mp4' },
  // HERO ART DIRECTION
  // position: 'horizontal% vertical%' (e.g. '65% 45%')
  // zoom: 1 is normal; 1.1 makes media 10% larger. flipX mirrors visually.
  // layout: 'full' fills the hero, 'right' gives square art its own right-side frame.
  // Mobile framing can be tuned independently; no image/video files are altered.
  slides: [
    {
      id: 'neylith',
      title: 'Neylith',
      category: 'ORIGINAL CREATURE DESIGN',
      caption: 'A creature in motion. A world just beyond the frame.',
      type: 'image',
      src: 'assets/Neylith.png',
      framing: {
        desktop: { layout: 'full', position: '50% 52%', zoom: 1.23, shiftX: '8%', flipX: false },
        mobile:  { position: '50% 50%', zoom: 1.08, shiftX: '0%', flipX: false }
      },
      visualStatus: 'original'
    },
    {
      id: 'galaxy',
      title: 'Galactic Visual Development',
      category: 'COSMIC ENVIRONMENTS & VFX',
      caption: 'A journey through light, scale, and the extraordinary.',
      type: 'video',
      src: 'assets/Galaxy_OG.mp4',
      poster: 'assets/Galaxy.png',
      framing: {
        desktop: { layout: 'full', position: '50% 50%', zoom: 1.25, shiftX: '8%', shiftY: '3%', flipX: true },
        mobile:  { position: '67% 50%', zoom: 1.12, shiftX: '0%', shiftY: '3%', flipX: true }
      },
      visualStatus: 'original'
    },
    {
      id: 'scientist-monkeys',
      title: 'Shard Run',
      category: 'GAME ART & ANIMATION',
      caption: 'Scientists collect shards. Monkeys turn the hunters into the hunted.',
      type: 'video',
      src: 'assets/Scientist_VS_Monkeys.mp4',
      poster: 'assets/poster2.png',
      framing: {
        desktop: { layout: 'full', position: '50% 48%', zoom: 1.42, shiftX: '3%', flipX: false },
        mobile:  { position: '54% 48%', zoom: 1.12, shiftX: '0%', flipX: false }
      },
      visualStatus: 'original'
    },
    {
      id: 'dnd-ruins',
      title: 'Runic Ruins',
      category: 'CINEMATIC ENVIRONMENTS & VFX',
      caption: 'An atmospheric passage through a world of lost magic.',
      type: 'video',
      src: 'assets/D&D_Intro.V4.mp4',
      poster: 'assets/D&D_Intro.V4-poster.png',
      framing: {
        desktop: { layout: 'full', position: '50% 50%', zoom: 1.09, shiftX: '2%', flipX: false },
        mobile:  { position: '62% 50%', zoom: 1.12, flipX: false }
      },
      visualStatus: 'original'
    }
  ],
  // SELECTED WORK LIBRARY. Update images/videos in /assets yourself.
  // 'image' is an optional PNG poster. If absent, a paused video frame is used.
  // 'video' is the detail-player source; 'supportingVideos' adds switchable process clips.
  // Add 'hoverVideo' only when a clip is suitably small for a fast preview.
  // 'layout' controls the editorial desktop grid; filtered results auto-reflow.
  projects: [
    {
      id: 'neylith',
      title: 'Neylith', subtitle: 'Original Creature Design',
      teaser: 'A creature caught between motion and myth.',
      description: 'An original fantasy creature presented in a painterly mountain composition. The design explores recognizable anatomy, an expressive silhouette, and the suggestion of movement within a still image.',
      disciplines: ['Character Art', 'Worldbuilding'], collection: 'Independent Work',
      medium: 'Creature design · Cinematic artwork',
      image: 'assets/Neylith.png', art: 'image',
      mediaLabel: 'STILL IMAGE', visualStatus: 'original', layout: 'lead',
      focus: 'center 46%'
    },
    {
      id: 'cosmic',
      title: 'Galactic Visual Development', subtitle: 'Sylver Soul · Environments & VFX',
      teaser: 'Light, scale, and the unknown.',
      description: 'A cosmic visual-effects study using light, motion, and contrast to communicate the immensity of an imagined celestial environment.',
      disciplines: ['Environments & VFX', 'Animation'], collection: 'Sylver Soul',
      medium: 'Cinematic VFX · Motion',
      image: 'assets/Galaxy.png', video: 'assets/Galaxy_OG.mp4', hoverVideo: 'assets/Galaxy_OG.mp4', art: 'video',
      mediaLabel: 'MOTION STUDY', visualStatus: 'original', layout: 'companion',
      focus: 'center 48%'
    },
    {
      id: 'scientist-monkeys',
      title: 'Shard Run', subtitle: 'Multiplayer Game · Character Art & Animation',
      hrefId: 'shard-run', heroVideo: 'assets/Shard_Run_Hero_PingPong.mp4',
      teaser: 'Collect the shards. Escape the monkeys. Or become one.',
      description: 'Shard Run is a chaotic multiplayer game of crystal collecting and tag. Scientists gather shards while monkeys hunt, convert, and claim their prizes. I created all the character assets, including scientists and monkeys, and their game animations as part of the development team.',
      disciplines: ['Character Art', 'Animation'], collection: 'Game Projects',
      medium: 'Multiplayer game · Full character asset production and animation',
      image: 'assets/poster2.png', video: 'assets/Scientist_VS_Monkeys.mp4', hoverVideo: 'assets/Scientist_VS_Monkeys.mp4', art: 'video',
      mediaLabel: 'GAME PROJECT', visualStatus: 'original', layout: 'companion',
      focus: '60% center',
      galleryTitle: 'Shards, monkeys, and the world between.',
      galleryIntro: 'Character, collectible, and game-world images from the original Shard Run project archive. Selected to complement the movement library and gameplay footage.',
      galleryImages: [
        {src:'assets/ShardRun_Chaos.webp', title:'Monkeys in action', caption:'A lively shot of the game characters in their environment.'},
        {src:'assets/ShardRun_Monkey.webp', title:'Monkey character', caption:'One of the stylized monkey character assets.'},
        {src:'assets/ShardRun_Map.webp', title:'Game environment', caption:'An in-game map view, including platforms and traversable structures.'},
        {src:'assets/ShardRun_Match.webp', title:'Scientists and monkeys', caption:'A game scene with the scientist and chasing monkeys.'},
        {src:'assets/ShardRun_Blue_Shard.webp', title:'Blue shard', caption:'A stylized shard collectible.'},
        {src:'assets/ShardRun_Green_Shard.webp', title:'Green shard', caption:'A contrasting shard collectible.'},
        {src:'assets/poster2.png', title:'Shard Run poster', caption:'Project presentation art from the existing portfolio collection.'}
      ]
    },
    {
      id: 'ruins',
      title: 'Runic Ruins', subtitle: 'Cinematic Environment & VFX',
      teaser: 'A glimpse into a forgotten place.',
      description: 'An atmospheric cinematic environment presented through lighting, environmental silhouettes, and animated effects. The video conveys a sense of exploration and narrative discovery.',
      disciplines: ['Environments & VFX', 'Animation'], collection: 'Independent Work',
      medium: 'Environment · Cinematic animation',
      image: 'assets/D&D_Intro.V4-poster.png', video: 'assets/D&D_Intro.V4.mp4', hoverVideo: 'assets/D&D_Intro.V4.mp4', art: 'video',
      mediaLabel: 'CINEMATIC MOTION', visualStatus: 'original', layout: 'lead',
      focus: 'center center'
    },
    {
      id: 'locomotion',
      title: 'Procedural Locomotion', subtitle: 'Blender · Technical Art',
      teaser: 'Designing the movement beneath the creature.',
      description: 'A configurable multi-legged locomotion system exploring gait coordination, foot placement, and IK reach management. A technical-art study in creating adaptable animation controls for complex creatures.',
      disciplines: ['Technical Art', 'Animation'], collection: 'Independent Work',
      medium: 'Procedural animation · Technical R&D',
      art: 'video', video: 'assets/Procedural_Walk_Test.mp4',
      hoverVideo: 'assets/Procedural_Walk_Test.mp4', previewTime: 1.2,
      supportingVideos: [
        { title: 'Rendered spider demonstration', src: 'assets/Phase_Spider_Walk.mp4' },
        { title: 'Beetle controls · Full walkthrough', src: 'assets/Procedural_Walk_Test2.mp4', note: 'Extended technical recording; load on demand' }
      ],
      mediaLabel: 'PROCEDURAL ANIMATION', visualStatus: 'original', layout: 'lead', focus: 'center center'
    },
    {
      id: 'titans',
      title: 'The Seven Titans', subtitle: 'Sylver Soul · Character Design',
      teaser: 'Seven beings. Seven visual identities.',
      description: 'Seven distinct beings created for Sylver Soul, each with its own visual identity, anatomy, materials, and thematic direction. Individual Titan presentations will join the gallery as their renders are selected.',
      disciplines: ['Character Art', 'Worldbuilding'], collection: 'Sylver Soul',
      medium: 'Original production · Character development',
      image: 'assets/Titans_Poster2.png', art: 'image', imageFit: 'contain', mediaLabel: 'CHARACTER SERIES', visualStatus: 'original', layout: 'companion'
    },
    {
      id: 'nari-room',
      title: 'Nari — Room Breakdown', subtitle: 'Environment Art · Scene Breakdown',
      teaser: 'From finished atmosphere to the construction beneath it.',
      description: 'A room study that first presents its atmospheric final render, then reveals the scene elements and staging behind the composition. The breakdown offers a closer look at how the environment is assembled.',
      disciplines: ['Environments & VFX', 'Animation'], collection: 'Environment Studies',
      medium: 'Environment design · Render-to-viewport breakdown',
      art: 'video', video: 'assets/Nari_Room_Breakdown.mp4', hoverVideo: 'assets/Nari_Room_Breakdown.mp4',
      previewTime: 1.2, mediaLabel: 'ENVIRONMENT BREAKDOWN', visualStatus: 'original', layout: 'lead', focus: 'center center'
    },
    {
      id: 'samurai',
      title: 'Samurai — Character Production', subtitle: 'Commissioned Character · Unreal Engine',
      teaser: 'An expressive character, built to survive the leap from sculpt to engine.',
      description: 'A commissioned game-character production and Unreal Engine integration study. From proportion and facial refinement through texture baking, rig preparation, expressive facial shapes, and an Alembic hair groom, the work combines character art with practical engine delivery.',
      disciplines: ['Character Art', 'Technical Art'], collection: 'Commissioned Work',
      medium: 'Character development · Rigging · Unreal Engine integration',
      commissioningCreator: { name: 'PanaDev',
        links: [
          { label: 'TikTok', url: 'https://www.tiktok.com/@panadev8' },
          { label: 'YouTube', url: 'https://www.youtube.com/@PanaGameDev' },
          { label: 'Instagram', url: 'https://www.instagram.com/pana.dev/' }
        ]
      },
      image: 'assets/Samurai_Hero_Web.jpg', art: 'image',
      mediaLabel: '3D CHARACTER / COMMISSION', visualStatus: 'original', layout: 'lead',
      heroFocus: '70% center', focus: '55% center'
    },
    {
      id: 'sky-jellies',
      title: 'Sky Jellies', subtitle: 'Game Production · Characters & World Assets',
      teaser: 'An entire little world of strange creatures, expressive forms, and bright environments.',
      description: 'A selection of stylized character, creature, and environment asset work produced for Sky Jellies during my collaboration with the P1 Gaming team. This project brings together playful character silhouettes, the astronaut turntable, a drone presentation, and development imagery for the game’s world.',
      disciplines: ['Character Art', 'Environments & VFX', 'Animation'], collection: 'Game Projects',
      medium: 'Team game project · Character, creature and environment assets',
      roleIntro: 'My work on Sky Jellies involved producing stylized 3D content for its cast and game world, including selected creature and character assets and environmental pieces. The astronaut and drone presentations, together with these development stills, show the breadth of the game-art work. Sky Jellies was a team production; this page documents my contributions rather than claiming the entire game.',
      art: 'video', video: 'assets/Astronaut_Turntable.mp4', hoverVideo: 'assets/Astronaut_Turntable.mp4',
      supportingVideos: [
        { title: 'Sky Jellies — Drone presentation', src: 'assets/SkyJellies_Drone_Web.mp4', poster: 'assets/SkyJellies_Drone_Poster.jpg', caption: 'Another stylized project asset from the original game archive, presented in motion.' }
      ],
      galleryTitle: 'A world of little oddities.',
      galleryIntro: 'A selected collection of creature, jelly, prop and environment artwork. These are in-development images and asset presentations rather than claims of sole authorship of the full game.',
      galleryImages: [
        {src:'assets/SkyJellies_Blue_Jelly.webp', title:'Blue jelly', caption:'A playful, expressive slime character.'},
        {src:'assets/SkyJellies_Jelly_Angle.webp', title:'Jelly — alternate view', caption:'Checking the form and expression from another angle.'},
        {src:'assets/SkyJellies_Bee.webp', title:'Bee creature', caption:'A compact creature with a readable and cheerful silhouette.'},
        {src:'assets/SkyJellies_Creature.webp', title:'Creature study', caption:'A larger stylized creature from the game-art archive.'},
        {src:'assets/SkyJellies_World_Environment.webp', title:'Elevated settlement', caption:'A scenic view of the stylized game environment.'},
        {src:'assets/SkyJellies_Island_Environment.webp', title:'Island environment', caption:'A wide view of the world and its interconnected islands.'},
        {src:'assets/SkyJellies_Tree.webp', title:'Stylized foliage', caption:'A simple, readable low-poly foliage asset.'},
        {src:'assets/SkyJellies_Platforms.webp', title:'Environment modules', caption:'Modular ground sections built around clear silhouettes.'}
      ],
      previewTime: 1.0, mediaLabel: 'GAME ART / CHARACTER DESIGN', visualStatus: 'original', layout: 'companion', focus: 'center center'
    }
  ],
// PHASE 4D — Extended project pages. The media library is intentionally curated:
  // only the selected clip is loaded into the secondary player at a time.
  // All media stays in assets/; no 3D project or editable source data is published.
  projectFeatures: {
    'scientist-monkeys': {
      // Short isolated gameplay animations loop; longer R&D recordings do not.
      loopClips: true,
      eyebrow: 'SHARD RUN / TEAM GAME PROJECT',
      heading: 'Personality in motion.',
      intro: 'A frantic multiplayer game of tag and crystal collection. Scientists race to gather shards while monkeys hunt them down. Catch a scientist and they become a monkey too—while the captor claims their collected bounty. Abilities such as haste, oil slicks, and banana peels add another layer of unpredictability to every chase.',
      clips: [
        {id:'idle', label:'Idle 01', title:'Monkey — Idle', src:'assets/Monkey_Idle.mp4', description:'A character idle animation presented independently from the game.'},
        {id:'idle-alt', label:'Idle 02', title:'Monkey — Alternate Idle', src:'assets/Monkey_Idle2.mp4', description:'An alternate idle performance for the monkey character.'},
        {id:'pounce', label:'Pounce', title:'Monkey — Pounce', src:'assets/Monkey_Pounce.mp4', description:'The monkey’s exaggerated attack movement, isolated so the timing and silhouette are easier to examine.'},
        {id:'run', label:'Run', title:'Monkey — Run Cycle', src:'assets/Monkey_Run.mp4', description:'The run cycle that helped give the monkey its distinctive in-game energy.'}
      ],
      roleTitle: 'Every character.\nEvery move.',
      roleIntro: 'I modeled the complete set of 3D character assets for Shard Run—from every scientist to every monkey—and created the game’s character animations. As part of the development team, my focus was on bringing the cast to life: expressive silhouettes, character performance, and readable movement during frantic multiplayer chases.',
      roleCards: [
        {title:'3D character production', text:'Built the scientist and monkey character models, translating the stylized direction into characters for the game.'},
        {title:'Game animation', text:'Created the character animation work used in the game, including the playful idle, movement, and pounce actions explored above.'},
        {title:'Unified character language', text:'Kept the character designs and animation expressive and immediately readable amid quick movement and multiplayer chaos.'}
      ],
      gameplay: {
        title: 'Shard Run — Gameplay Highlights',
        src: 'assets/Shard_Run_Gameplay_Highlights.mp4',
        caption: 'A multiplayer match from the artist’s archive, featuring the crystal-collecting scientists and the monkeys that tag and convert them. Gameplay footage includes the game’s original sound.',
        label: 'MULTIPLAYER / RECORDED MATCH',
        // The artist can replace this file with a new edit without updating the website.
        note: 'Gameplay highlight edit · Character models and animations by Jaydn Nickie · Other game contributions are collaborative.'
      },
      sections: [],
      futureNote: ''
    },
    locomotion: {
      eyebrow: 'TECHNICAL ART / BLENDER R&D',
      heading: 'Making legs think.',
      intro: 'A procedural stepping and gait system for multi-legged characters. The focus is not merely a single animation, but a configurable framework for coordinating legs, predicting movement, managing foot placement, and keeping steps within useful IK limits.',
      sections: [
        {number:'01', title:'Foot placement', text:'Each leg has a resting region, step triggers, and controls for step distance, speed, and lift, allowing the motion to respond to the character rather than relying on a fixed walk cycle.'},
        {number:'02', title:'Gait coordination', text:'Staggering and timing controls help coordinate multiple legs. The same system is explored with different creatures and movement rhythms.'},
        {number:'03', title:'Prediction & constraints', text:'Prediction distance, velocity influence, and IK reach protection help keep foot targets useful as the body moves.'},
        {number:'04', title:'Tool-first iteration', text:'The test recordings reveal the adjustable controls alongside their effect on the resulting motion—an important part of making procedural behavior practical for artists.'}
      ],
      clips: [
        {id:'spider', label:'Rendered Spider', title:'Rendered Spider — Final Motion', src:'assets/Phase_Spider_Walk.mp4', description:'A polished rendered demonstration of the locomotion system in action.'},
        {id:'walk', label:'Walk Test', title:'Procedural Walk — System Test', src:'assets/Procedural_Walk_Test.mp4', description:'An overview of procedural walking behavior and foot motion on a test creature.'}
      ],
      futureNote: 'Coming next: a shorter web-ready beetle-controls walkthrough, plus parameter diagrams and node-group screenshots. The full-resolution development recording stays offline for now.'
    }
  },
  // CASE STUDIES — one content record can power a dedicated, shareable project URL.
  // The project page at /projects/tipsy-the-teapot/ uses caseStudies["tipsy-the-teapot"].
  caseStudies: {
    'tipsy-the-teapot': {
      title: 'Tipsy the Teapot',
      kicker: '3D CHARACTER / PROP ADAPTATION',
      eyebrow: 'CASE STUDY 01',
      subtitle: 'Giving a little teapot its third dimension.',
      headingLines: ['Tipsy the', 'Teapot.'],
      overview: 'A stylized 3D adaptation developed from a single illustrated reference. The challenge was not simply recreating an appealing silhouette, but making its unusual proportions and decorative details feel convincing from every angle.',
      disciplines: ['3D Modeling', 'Stylized Prop Art', '2D-to-3D Adaptation'],
      context: 'Independent study',
      role: '3D adaptation and presentation',
      // Credit original artwork before publishing publicly; a Pinterest save is not attribution.
      reference: {
        image: 'assets/Teapot_Reference.jpg',
        artist: null,
        url: null,
        status: 'Original illustrated reference supplied; artist attribution pending verification.'
      },
      challenge: 'The original illustration offered one view of the design. Building a complete 3D model meant interpreting what could not be seen, including the depth, profile, connections, and volume of its exaggerated forms.',
      approach: 'I focused on keeping the proportions and silhouette recognizable while giving the ornamentation, spout, body, and supporting forms enough structure to remain readable as the camera moved around the model.',
      closing: 'The finished turntable and modeling breakdown are presented together so visitors can see both the character of the final piece and the geometry supporting it.',
      media: [
        {title: 'Finished turntable', label: '01 / FINISHED ARTWORK', src: 'assets/Tipsy_the_TeaPot.mp4', caption: 'A full rotation of the finished stylized teapot, showing the silhouette, surface treatment, and decorative details.'},
        {title: 'Model breakdown', label: '02 / BEHIND THE MODEL', src: 'assets/TeaPot_Breakdown.mp4', caption: 'A closer look at the model beneath the finished presentation, including its underlying geometry and forms.'}
      ]
    }
  }

};
