/**
 * 📊 Bangkok Club Crawl — Data Layer
 * Contains JSON schemas, content data, and state management logic.
 */

const BCC_DATA = {
    // Content for the "What's Included" section
    features: [
        {
            id: 'venues',
            title: '4 CURATED VENUES',
            description: 'Hand-picked venues selected for energy, style, and flow.',
            icon: '📍' // Will be replaced by rose gold SVG icons
        },
        {
            id: 'priority-entry',
            title: 'PRIORITY ENTRY',
            description: 'Skip standard lines at selected stops.',
            icon: '👑'
        },
        {
            id: 'hosts',
            title: 'DEDICATED HOSTS',
            description: 'Professional hosts guiding the rhythm of the night.',
            icon: '👥'
        },
        {
            id: 'transport',
            title: 'SMOOTH TRANSPORT',
            description: 'Seamless transitions between venues so the energy never drops.',
            icon: '🚗'
        },
        {
            id: 'drinks',
            title: 'WELCOME DRINKS',
            description: 'Ice-breaking shots at selected stops.',
            icon: '🥃'
        },
        {
            id: 'crowd',
            title: 'INTERNATIONAL CROWD',
            description: 'A curated mix of travelers and locals.',
            icon: '✨'
        }
    ],

    // 3-Ritual System
    rituals: [
        {
            phase: 'The Spark',
            energy: '40%',
            title: 'COCKTAILS & CONNECTION',
            description: 'A relaxed, social atmosphere where the ice breaks naturally.',
            image: 'assets/images/image.remini-enhanced (9).jpg'
        },
        {
            phase: 'The Build',
            energy: '70%',
            title: 'TRANSITION & MOMENTUM',
            description: 'Moving to a high-energy bar. The music builds. The connection deepens.',
            image: 'assets/images/image.remini-enhanced (11).jpg'
        },
        {
            phase: 'The Takeover',
            energy: '95%',
            title: 'PEAK VIBE & CLUBS',
            description: 'Late-night club entry with priority access. The final surge. Full energy. Full momentum.',
            image: 'assets/images/image.remini-enhanced (8).jpg'
        }
    ],

    // Weekend Routes
    routes: {
        friday: [
            {
                id: 'stop1',
                stop: "STOP 01",
                venue: "The Spark",
                music: "Afro House",
                description: "Afro house rhythms under open skies. Fire performances light the atmosphere as the group breaks the ice and settles into the night.",
                image: "assets/images/Lamaya group shot1.JPG"
            },
            {
                id: 'stop2',
                stop: "STOP 02",
                venue: "The Rise",
                music: "Hip-Hop",
                description: "Hip-hop beats and high-energy atmosphere. The crowd loosens up fast — this is where confidence rises and rhythm starts to take over.",
                image: "assets/images/Rhodes group pic.JPG"
            },
            {
                id: 'stop3',
                stop: "STOP 03",
                venue: "The Descent",
                music: "Techno",
                description: "A dark, cinematic interior inspired by vintage Shanghai. Hypnotic techno pulses through the space — mysterious, immersive, and unforgettable.",
                image: "assets/images/Singsing shot.jpeg"
            },
            {
                id: 'stop4',
                stop: "STOP 04",
                venue: "The Peak",
                music: "EDM & Anthems",
                description: "Upscale rooftop energy. EDM drops and familiar anthems. The final stretch where everyone dances without hesitation.",
                image: "assets/images/Chupa group shot.JPG"
            }
        ],
        saturday: [
            {
                id: 'stop1',
                stop: "STOP 01",
                venue: "The Spark",
                music: "Afro House",
                description: "Afro house rhythms under open skies. Fire performances light the atmosphere as the group breaks the ice and settles into the night.",
                image: "assets/images/Lamaya group shot1.JPG"
            },
            {
                id: 'stop2',
                stop: "STOP 02",
                venue: "The Rise",
                music: "Hip-Hop",
                description: "Hip-hop beats and high-energy atmosphere. The crowd loosens up fast — this is where confidence rises and rhythm starts to take over.",
                image: "assets/images/Rhodes group pic.JPG"
            },
            {
                id: 'stop3',
                stop: "STOP 03",
                venue: "The Descent",
                music: "Techno",
                description: "A dark, cinematic interior inspired by vintage Shanghai. Hypnotic techno pulses through the space — mysterious, immersive, and unforgettable.",
                image: "assets/images/Singsing shot.jpeg"
            },
            {
                id: 'stop4',
                stop: "STOP 04",
                venue: "The Peak",
                music: "EDM & Anthems",
                description: "Upscale rooftop energy. EDM drops and familiar anthems. The final stretch where everyone dances without hesitation.",
                image: "assets/images/Chupa group shot.JPG"
            }
        ]
    },

    // FAQ Content addressing top 5 hesitations
    faqs: [
        {
            question: "I'm nervous to go alone.",
            answer: "Most of our guests arrive solo. Our night is intentionally structured to break the ice naturally from the first toast. You'll arrive solo but leave with a crew."
        },
        {
            question: "Is it worth the 1,500 THB price?",
            answer: "You're paying for a curated, premium experience. This includes priority access to 4 high-end venues, smooth transportation, welcome drinks, and professional hosting. It's intentionally guided — so the night flows without chaos."
        },
        {
            question: "What kind of crowd joins?",
            answer: "Our audience is primarily international travelers, expats, and young professionals aged 23–38. It's a social, smoothly guided environment without the backpacker chaos."
        },
        {
            question: "Is this just about drinking?",
            answer: "No. While we enjoy drinks, our focus is 'Smoothly Guided Flow'. The night is designed for connection and flow, moving through different energy levels from a relaxed spark to a high-energy climax."
        },
        {
            question: "Will the event actually happen?",
            answer: "We run every Friday and Saturday. We confirm final guest counts by 7 PM on the day. If for some reason we don't meet our minimum, you'll be offered a reschedule or a full refund immediately."
        }
    ],

    // Night Conductors (Hosts)
    hosts: [
        {
            id: 'host-ice',
            name: 'Ice',
            image: 'assets/images/IceBaby.jpg',
            role: 'Lead Host',
            shortDesc: 'High energy with sharp intuition.',
            description: 'Ice reads the room instantly. She turns hesitation into momentum and makes strangers feel like they’ve known each other for years. Confident, warm, and always in control of the vibe.',
            badges: ['Crowd Reader', 'Energy Builder', 'International Friendly', 'Flow Keeper'],
            stats: 'Hosted 220+ Nights'
        },
        {
            id: 'host-boom',
            name: 'Boom',
            image: 'assets/images/Boom.jpg',
            role: 'Operations Host',
            shortDesc: 'Smooth transitions. Calm control.',
            description: 'Boom ensures every move between venues feels effortless. She keeps timing tight, energy steady, and the group aligned without ever forcing it. Precision without pressure.',
            badges: ['Seamless Transitions', 'Group Alignment', 'Music Sense', 'Rhythm Control'],
            stats: 'Hosted 180+ Nights'
        },
        {
            id: 'host-jj',
            name: 'JJ',
            image: 'assets/images/JJ.jpg',
            role: 'Energy Host',
            shortDesc: 'Confident presence. Natural magnetism.',
            description: 'JJ brings grounded intensity. She knows when to lift the tempo and when to let the night breathe. Guests trust her instinct — and follow her lead without hesitation.',
            badges: ['High-Energy Presence', 'Room Awareness', 'Moment Builder', 'Guest Connector'],
            stats: 'Hosted 150+ Nights'
        }
    ],

    // JSON Schemas as reference (from Gemini.md)
    schemas: {
        guest: {
            required: ['firstName', 'lastName', 'email', 'phone', 'gender'],
            enums: {
                gender: ['male', 'female', 'other'],
                source: ['direct', 'airbnb', 'getyourguide', 'viator', 'instagram', 'referral', 'other']
            }
        },
        booking: {
            required: ['guestId', 'eventId', 'quantity'],
            logic: {
                malePrice: 1500,
                femalePrice: 1200,
                privateTrigger: 8
            }
        }
    }
};

/**
 * 🛠️ Data Utility Methods
 */
const BCC_UTILS = {
    // Calculate price based on gender and quantity
    calculatePrice: (gender, quantity) => {
        const unitPrice = gender === 'female' ? BCC_DATA.schemas.booking.logic.femalePrice : BCC_DATA.schemas.booking.logic.malePrice;
        return unitPrice * quantity;
    },

    // Format currency to THB
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            maximumFractionDigits: 0
        }).format(amount);
    }
};
