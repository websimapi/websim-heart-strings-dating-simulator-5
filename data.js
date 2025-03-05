const CHARACTERS = [
    {
        id: "emily",
        name: "Emily",
        gender: "female",
        imageSeed: 42,
        imagePrompt: "Professional digital portrait of a cheerful young woman with shoulder-length auburn hair and bright green eyes, artistic, natural look, soft smile, graphic designer, warm lighting, neutral background, eye level, photorealistic",
        profile: {
            personality: "Cheerful, artistic, loves nature",
            interests: "Painting, hiking, indie music, photography, coffee",
            background: "Graphic designer with dreams of opening an art gallery"
        },
        initialRelationship: 0
    },
    {
        id: "james",
        name: "James",
        gender: "male",
        imageSeed: 123,
        imagePrompt: "Professional digital portrait of an ambitious young man with short brown hair and blue eyes, analytical look, slight smile, tech-savvy appearance, software engineer, indoor lighting, neutral background, eye level, photorealistic",
        profile: {
            personality: "Ambitious, witty, analytical",
            interests: "Technology, rock climbing, strategy games, sci-fi novels, trying new restaurants",
            background: "Software engineer with his own tech startup"
        },
        initialRelationship: 0
    },
    {
        id: "sophia",
        name: "Sophia",
        gender: "female",
        imageSeed: 789,
        imagePrompt: "Professional digital portrait of a confident young woman with long dark hair and brown eyes, adventurous expression, stylish appearance, travel journalist, outdoor lighting, neutral background, eye level, photorealistic",
        profile: {
            personality: "Confident, adventurous, passionate",
            interests: "Traveling, dancing, cooking international cuisines, fashion, learning languages",
            background: "Travel journalist who has lived in five different countries"
        },
        initialRelationship: 0
    },
    {
        id: "marcus",
        name: "Marcus",
        gender: "male",
        imageSeed: 456,
        imagePrompt: "Professional digital portrait of a thoughtful young man with glasses, curly black hair and brown eyes, kind expression, creative look, literature professor, soft lighting, neutral background, eye level, photorealistic",
        profile: {
            personality: "Thoughtful, creative, kind",
            interests: "Writing poetry, playing guitar, documentaries, volunteering, quiet cafes",
            background: "Literature professor who publishes poetry"
        },
        initialRelationship: 0
    },
    {
        id: "olivia",
        name: "Olivia",
        gender: "female",
        imageSeed: 654,
        imagePrompt: "Professional digital portrait of an energetic young woman with athletic build, blonde hair in ponytail, bright smile, fitness enthusiast, personal trainer, outdoor lighting, neutral background, eye level, photorealistic",
        profile: {
            personality: "Energetic, optimistic, competitive",
            interests: "Fitness, team sports, healthy cooking, motivational books, outdoor activities",
            background: "Personal trainer and former college athlete"
        },
        initialRelationship: 0
    }
];

const LOCATIONS = [
    {
        id: "seaside-cafe",
        name: "Seaside Café",
        atmosphere: "Relaxed, romantic, peaceful",
        description: "A charming café with floor-to-ceiling windows offering stunning views of the ocean",
        imageSeed: 111,
        imagePrompt: "Wide angle view of a charming seaside café interior with floor-to-ceiling windows, ocean view, sunlight streaming in, cozy seating, wood tables, coffee cups, relaxed atmosphere, no people, photorealistic, 16:9 aspect ratio"
    },
    {
        id: "botanical-gardens",
        name: "Botanical Gardens",
        atmosphere: "Serene, beautiful, intimate",
        description: "Winding paths through beautiful displays of plants from around the world",
        imageSeed: 222,
        imagePrompt: "Wide angle view of lush botanical gardens with winding stone paths, colorful flowers, exotic plants, green foliage, sunlight filtering through leaves, serene atmosphere, no people, photorealistic, 16:9 aspect ratio"
    },
    {
        id: "rooftop-lounge",
        name: "Rooftop Lounge",
        atmosphere: "Sophisticated, trendy, exciting",
        description: "Trendy spot offering breathtaking views of the city skyline",
        imageSeed: 333,
        imagePrompt: "Wide angle view of sophisticated rooftop lounge with comfortable seating, ambient lighting, cityscape view, skyline at dusk, urban setting, trendy atmosphere, no people, photorealistic, 16:9 aspect ratio"
    },
    {
        id: "art-gallery",
        name: "Art Gallery",
        atmosphere: "Cultured, intellectual, inspiring",
        description: "Modern space showcasing works from local and international artists",
        imageSeed: 444,
        imagePrompt: "Wide angle view of modern art gallery interior with white walls, multiple art pieces displayed, track lighting, wooden floors, minimalist design, cultured atmosphere, no people, photorealistic, 16:9 aspect ratio"
    },
    {
        id: "lakeside-park",
        name: "Lakeside Park",
        atmosphere: "Natural, peaceful, casual",
        description: "Picturesque park with a shimmering lake at its center",
        imageSeed: 555,
        imagePrompt: "Wide angle view of picturesque lakeside park with shimmering water, green grass, trees, park benches, walking paths, blue sky, natural lighting, peaceful atmosphere, no people, photorealistic, 16:9 aspect ratio"
    },
    {
        id: "vintage-arcade",
        name: "Vintage Arcade",
        atmosphere: "Playful, nostalgic, energetic",
        description: "Step back in time in this nostalgic arcade filled with classic games",
        imageSeed: 666,
        imagePrompt: "Wide angle view of vintage arcade interior with classic arcade cabinets, neon lighting, retro design, row of pinball machines, nostalgic atmosphere, colorful, playful environment, no people, photorealistic, 16:9 aspect ratio"
    }
];

