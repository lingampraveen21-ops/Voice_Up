export type SectionType = 'text' | 'example' | 'vocab'

export interface VocabWord {
    word: string
    definition: string
    example: string
}

export interface Section {
    type: SectionType
    content: string
}

export interface QuizQuestion {
    id: string
    type: 'mcq' | 'fill' | 'voice'
    question: string
    options?: string[]
    answer: string
}

export interface Lesson {
    id: string
    moduleId: string
    order: number
    title: string
    skill: 'speaking' | 'listening' | 'reading' | 'writing'
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1'
    duration: number // minutes
    sections: Section[]
    vocabulary: VocabWord[]
    quiz: QuizQuestion[]
}

export interface Module {
    id: string
    title: string
    description: string
    icon: string
    lessons: Lesson[]
}

export const MODULES: Module[] = [
    {
        id: 'mod-1',
        title: 'Everyday Conversations',
        description: 'Master greetings, small talk, and daily interactions',
        icon: '💬',
        lessons: [
            {
                id: 'l-1-1', moduleId: 'mod-1', order: 1,
                title: 'Greetings & Introductions', skill: 'speaking', level: 'A1', duration: 10,
                sections: [
                    { type: 'text', content: 'In English, greetings vary by time of day and formality. "Hello" and "Hi" work any time. "Good morning" is used before noon, "Good afternoon" from noon to 6pm, and "Good evening" after 6pm.' },
                    { type: 'example', content: '"Hello! My name is Sarah. Nice to meet you!" — "Hi Sarah, I\'m James. Great to meet you too!"' },
                    { type: 'vocab', content: 'greet|introduce|formal|informal|acquaintance' },
                ],
                vocabulary: [
                    { word: 'greet', definition: 'To say hello and welcome someone', example: 'She smiled and greeted her new colleague warmly.' },
                    { word: 'introduce', definition: 'To present someone to another person for the first time', example: 'Let me introduce you to our team.' },
                    { word: 'formal', definition: 'Appropriate for official or serious situations', example: 'The interview was very formal.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which greeting is appropriate before noon?', options: ['Good evening', 'Good morning', 'Good night', 'Good afternoon'], answer: 'Good morning' },
                    { id: 'q2', type: 'fill', question: 'Complete: "Nice to ___ you!"', answer: 'meet' },
                    { id: 'q3', type: 'voice', question: 'Introduce yourself in 2 sentences.', answer: '' },
                ]
            },
            {
                id: 'l-1-2', moduleId: 'mod-1', order: 2,
                title: 'Asking & Answering Questions', skill: 'speaking', level: 'A1', duration: 12,
                sections: [
                    { type: 'text', content: 'English questions use auxiliary verbs. "Do you...?" and "Are you...?" are the most common patterns for yes/no questions. "What", "Where", "When", "Why", and "How" begin open questions.' },
                    { type: 'example', content: '"Do you speak English?" — "Yes, I do. I learned it in school." | "Where are you from?" — "I\'m from Mumbai, India."' },
                    { type: 'vocab', content: 'auxiliary|interrogative|affirmative|negative|response' },
                ],
                vocabulary: [
                    { word: 'auxiliary', definition: 'A verb used with a main verb (do, be, have)', example: '"Do" is an auxiliary verb in "Do you like coffee?"' },
                    { word: 'interrogative', definition: 'A question word or sentence', example: '"Where are you going?" is an interrogative sentence.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which is a correct yes/no question?', options: ['You speak English?', 'Do you speak English?', 'Speak you English?', 'You do speak English?'], answer: 'Do you speak English?' },
                    { id: 'q2', type: 'fill', question: '___ are you from?', answer: 'Where' },
                    { id: 'q3', type: 'voice', question: 'Ask me 2 questions about my weekend.', answer: '' },
                ]
            },
            {
                id: 'l-1-3', moduleId: 'mod-1', order: 3,
                title: 'Talking About Your Day', skill: 'speaking', level: 'A2', duration: 15,
                sections: [
                    { type: 'text', content: 'Use simple past tense to talk about completed actions: "I woke up at 7am. I had breakfast. I went to work." Use connectors: "then", "after that", "finally".' },
                    { type: 'example', content: '"This morning I woke up early, then I had coffee. After that, I checked my emails. Finally, I started working on a report."' },
                    { type: 'vocab', content: 'routine|connector|sequence|past tense|narrate' },
                ],
                vocabulary: [
                    { word: 'routine', definition: 'A regular sequence of actions', example: 'My morning routine starts with exercise.' },
                    { word: 'sequence', definition: 'The order in which things happen', example: 'Tell me the sequence of events.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which connector shows sequence?', options: ['However', 'Although', 'After that', 'Despite'], answer: 'After that' },
                    { id: 'q2', type: 'fill', question: 'I ___ (wake) up at 7am this morning.', answer: 'woke' },
                    { id: 'q3', type: 'voice', question: 'Describe what you did this morning.', answer: '' },
                ]
            },
            {
                id: 'l-1-4', moduleId: 'mod-1', order: 4,
                title: 'Making Plans & Suggestions', skill: 'speaking', level: 'A2', duration: 12,
                sections: [
                    { type: 'text', content: 'Use "shall we", "how about", "why don\'t we", and "let\'s" to make suggestions. Use "I\'d like to" and "could we" to make polite requests.' },
                    { type: 'example', content: '"How about going for lunch?" — "That sounds great! Shall we invite Priya too?" — "Sure, let\'s ask her!"' },
                    { type: 'vocab', content: 'suggestion|invitation|proposal|agree|decline' },
                ],
                vocabulary: [
                    { word: 'suggestion', definition: 'An idea put forward for others to consider', example: 'She made a great suggestion about the project.' },
                    { word: 'decline', definition: 'To politely refuse', example: 'He had to decline the invitation due to a prior commitment.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which phrase makes a suggestion?', options: ['I must go', 'You should go', 'How about going?', 'I will go'], answer: 'How about going?' },
                    { id: 'q2', type: 'fill', question: '___ we go to the cinema?', answer: 'Shall' },
                    { id: 'q3', type: 'voice', question: 'Suggest a plan for the weekend.', answer: '' },
                ]
            },
            {
                id: 'l-1-5', moduleId: 'mod-1', order: 5,
                title: 'Expressing Opinions Politely', skill: 'speaking', level: 'B1', duration: 15,
                sections: [
                    { type: 'text', content: 'Soften opinions with: "I think", "In my opinion", "I feel that", "It seems to me". Disagree politely: "I see your point, but...", "That\'s interesting, however..."' },
                    { type: 'example', content: '"I think remote work is more productive." — "I see your point, but I feel that office collaboration is important too."' },
                    { type: 'vocab', content: 'opinion|perspective|argument|counterpoint|diplomatic' },
                ],
                vocabulary: [
                    { word: 'diplomatic', definition: 'Careful not to offend others when expressing views', example: 'She gave a diplomatic answer that satisfied everyone.' },
                    { word: 'counterpoint', definition: 'An argument made against another argument', example: 'He raised a valid counterpoint in the debate.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which phrase politely disagrees?', options: ['You are wrong', 'No, that\'s false', 'I see your point, but...', 'That is incorrect'], answer: 'I see your point, but...' },
                    { id: 'q2', type: 'fill', question: '___ my opinion, teamwork leads to better results.', answer: 'In' },
                    { id: 'q3', type: 'voice', question: 'Share your opinion on working from home.', answer: '' },
                ]
            },
        ]
    },
    {
        id: 'mod-2',
        title: 'Professional English',
        description: 'Excel in meetings, emails, and workplace communication',
        icon: '💼',
        lessons: [
            { id: 'l-2-1', moduleId: 'mod-2', order: 1, title: 'Email Writing Essentials', skill: 'writing', level: 'B1', duration: 15, sections: [{ type: 'text', content: 'Professional emails have 5 parts: subject line, greeting, body, closing, signature. Subject lines should be clear and specific.' }, { type: 'example', content: 'Subject: Meeting Request – Q2 Review\n\nDear Ms. Johnson,\nI hope this email finds you well. I would like to schedule a meeting to discuss our Q2 results...' }], vocabulary: [{ word: 'concise', definition: 'Brief and clear', example: 'Keep your email concise and to the point.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What comes after the greeting?', options: ['Signature', 'Subject', 'Body', 'Closing'], answer: 'Body' }, { id: 'q2', type: 'fill', question: 'I hope this email ___ you well.', answer: 'finds' }, { id: 'q3', type: 'voice', question: 'Dictate a short professional email requesting a day off.', answer: '' }] },
            { id: 'l-2-2', moduleId: 'mod-2', order: 2, title: 'Job Interviews', skill: 'speaking', level: 'B2', duration: 20, sections: [{ type: 'text', content: 'Use the STAR method: Situation, Task, Action, Result. Start answers with context, explain your role, describe steps taken, and share the outcome.' }, { type: 'example', content: '"Tell me about a challenge you overcame." — "In my previous role (Situation), I was tasked with reducing costs (Task). I analyzed our vendors and renegotiated contracts (Action), saving 20% (Result)."' }], vocabulary: [{ word: 'competency', definition: 'A skill or ability required for a job', example: 'Leadership is a key competency for this role.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What does STAR stand for?', options: ['Strategy, Task, Action, Result', 'Situation, Task, Action, Result', 'Situation, Time, Action, Result', 'Skill, Task, Approach, Result'], answer: 'Situation, Task, Action, Result' }, { id: 'q2', type: 'fill', question: 'Tell me ___ yourself.', answer: 'about' }, { id: 'q3', type: 'voice', question: 'Answer: Why should we hire you?', answer: '' }] },
            { id: 'l-2-3', moduleId: 'mod-2', order: 3, title: 'Meeting Participation', skill: 'speaking', level: 'B1', duration: 15, sections: [{ type: 'text', content: 'Key phrases: "Could I add something?", "I\'d like to build on that point", "Can we circle back to...?", "Let\'s table that for now."' }], vocabulary: [{ word: 'agenda', definition: 'A list of items to be discussed', example: 'The meeting agenda was sent in advance.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'How do you politely interrupt?', options: ['Stop!', 'Could I add something?', 'Let me speak', 'Be quiet'], answer: 'Could I add something?' }, { id: 'q2', type: 'fill', question: 'Let\'s ___ back to the budget question.', answer: 'circle' }, { id: 'q3', type: 'voice', question: 'Suggest an agenda item for a team meeting.', answer: '' }] },
            { id: 'l-2-4', moduleId: 'mod-2', order: 4, title: 'Presentations', skill: 'speaking', level: 'B2', duration: 20, sections: [{ type: 'text', content: 'Structure: Opening hook → Overview → Main points → Summary → Q&A. Use signposting: "Moving on to...", "To summarize...", "As you can see..."' }], vocabulary: [{ word: 'signpost', definition: 'A word/phrase guiding the audience through your talk', example: '"Moving on" is a common signpost phrase.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What comes after the main points?', options: ['Opening hook', 'Q&A', 'Summary', 'Overview'], answer: 'Summary' }, { id: 'q2', type: 'fill', question: '___ on to our next slide…', answer: 'Moving' }, { id: 'q3', type: 'voice', question: 'Give a 30-second introduction for a presentation.', answer: '' }] },
            { id: 'l-2-5', moduleId: 'mod-2', order: 5, title: 'Negotiation Language', skill: 'speaking', level: 'C1', duration: 20, sections: [{ type: 'text', content: 'Key tactics: anchoring (state your position first), bridging ("What if we...?"), conceding ("I can accept X if you agree to Y").' }], vocabulary: [{ word: 'concede', definition: 'To admit or agree to something in a negotiation', example: 'We conceded on price but gained better terms.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What is anchoring?', options: ['Ending a negotiation', 'Stating your position first', 'Agreeing to all terms', 'Taking notes'], answer: 'Stating your position first' }, { id: 'q2', type: 'fill', question: 'I can accept that ___ you agree to a 6-month contract.', answer: 'if' }, { id: 'q3', type: 'voice', question: 'Negotiate a deadline extension with your manager.', answer: '' }] },
        ]
    },
    {
        id: 'mod-3',
        title: 'Grammar Foundations',
        description: 'Master tenses, articles, prepositions, and sentence structure',
        icon: '📖',
        lessons: [
            { id: 'l-3-1', moduleId: 'mod-3', order: 1, title: 'Present & Past Tenses', skill: 'writing', level: 'A2', duration: 15, sections: [{ type: 'text', content: 'Simple Present: "I work". Present Continuous: "I am working". Simple Past: "I worked". Past Continuous: "I was working". Choose based on timing and completion.' }, { type: 'example', content: '"I usually wake up at 7am" (habit) vs "I am waking up now" (in progress) vs "I woke up late today" (completed).' }], vocabulary: [{ word: 'tense', definition: 'A verb form showing time of action', example: '"Walked" is past tense of "walk".' }], quiz: [{ id: 'q1', type: 'mcq', question: 'Which is the present continuous?', options: ['I work', 'I worked', 'I am working', 'I have worked'], answer: 'I am working' }, { id: 'q2', type: 'fill', question: 'She ___ (study) when I called.', answer: 'was studying' }, { id: 'q3', type: 'voice', question: 'Describe what you are doing right now.', answer: '' }] },
            { id: 'l-3-2', moduleId: 'mod-3', order: 2, title: 'Articles (a, an, the)', skill: 'writing', level: 'A2', duration: 12, sections: [{ type: 'text', content: 'Use "a/an" when introducing something new or non-specific. Use "the" for specific or previously mentioned things. Omit articles with proper nouns and general concepts.' }, { type: 'example', content: '"I saw a dog." (first mention) → "The dog was barking." (same dog).' }], vocabulary: [{ word: 'article', definition: 'The words a, an, the used before nouns', example: '"The" is a definite article.' }], quiz: [{ id: 'q1', type: 'fill', question: 'I bought ___ apple from ___ market.', answer: 'an / the' }, { id: 'q2', type: 'mcq', question: 'When do we use "the"?', options: ['First mention', 'Any noun', 'Specific/known reference', 'Plural nouns only'], answer: 'Specific/known reference' }, { id: 'q3', type: 'voice', question: 'Describe an object in your room using articles correctly.', answer: '' }] },
            { id: 'l-3-3', moduleId: 'mod-3', order: 3, title: 'Prepositions of Time & Place', skill: 'writing', level: 'B1', duration: 12, sections: [{ type: 'text', content: 'Time: "at" (specific time), "on" (days/dates), "in" (months/years). Place: "at" (specific point), "on" (surface), "in" (enclosed space).' }, { type: 'example', content: '"I arrive at 9am, on Monday, in January." / "I\'m at the station, on platform 3, in the train."' }], vocabulary: [{ word: 'preposition', definition: 'A word showing relationship between nouns', example: '"At", "on", "in" are prepositions.' }], quiz: [{ id: 'q1', type: 'fill', question: 'The meeting is ___ Monday ___ 3pm.', answer: 'on / at' }, { id: 'q2', type: 'mcq', question: 'Which is correct?', options: ['on the morning', 'in the morning', 'at the morning', 'by the morning'], answer: 'in the morning' }, { id: 'q3', type: 'voice', question: 'Describe where you are sitting right now.', answer: '' }] },
            { id: 'l-3-4', moduleId: 'mod-3', order: 4, title: 'Conditionals', skill: 'writing', level: 'B1', duration: 15, sections: [{ type: 'text', content: 'Zero: "If water freezes, it becomes ice." First: "If it rains, I will stay home." Second: "If I had time, I would travel." Third: "If I had studied, I would have passed."' }], vocabulary: [{ word: 'conditional', definition: 'A sentence structure expressing hypothetical situations', example: '"If I win, I will celebrate" is a first conditional.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'Which is a second conditional?', options: ['If it rains, I will stay', 'If I had money, I would travel', 'Water boils if heated', 'If I studied, I passed'], answer: 'If I had money, I would travel' }, { id: 'q2', type: 'fill', question: 'If I ___ (be) you, I would apply for the job.', answer: 'were' }, { id: 'q3', type: 'voice', question: 'Use a conditional to describe a life decision.', answer: '' }] },
            { id: 'l-3-5', moduleId: 'mod-3', order: 5, title: 'Passive Voice', skill: 'writing', level: 'B2', duration: 15, sections: [{ type: 'text', content: 'Passive: "The report was written by Sarah." Use when the action matters more than who did it, or when the doer is unknown. Form: be + past participle.' }, { type: 'example', content: 'Active: "The manager approved the budget." Passive: "The budget was approved by the manager."' }], vocabulary: [{ word: 'passive', definition: 'A sentence structure where the subject receives the action', example: '"The cake was eaten" is passive voice.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'Which is passive voice?', options: ['She wrote the report', 'The report was written', 'She is writing a report', 'She will write a report'], answer: 'The report was written' }, { id: 'q2', type: 'fill', question: 'The letter ___ (send) yesterday.', answer: 'was sent' }, { id: 'q3', type: 'voice', question: 'Describe your morning routine using passive voice.', answer: '' }] },
        ]
    },
    {
        id: 'mod-4',
        title: 'Listening & Comprehension',
        description: 'Understand native speakers at natural pace',
        icon: '🎧',
        lessons: [
            { id: 'l-4-1', moduleId: 'mod-4', order: 1, title: 'Understanding Accents', skill: 'listening', level: 'B1', duration: 15, sections: [{ type: 'text', content: 'English has many accents: British (RP), American (General American), Australian, Indian English. Key differences are in vowel sounds and rhythm.' }, { type: 'example', content: '"Water" in American English: "WAH-der". British English: "WAW-tah". Focus on context clues when an accent is unfamiliar.' }], vocabulary: [{ word: 'accent', definition: 'A distinctive way of pronouncing a language', example: 'Her Scottish accent was charming.' }, { word: 'intonation', definition: 'The rise and fall of voice pitch in speech', example: 'Questions usually rise in intonation.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What differs most between accents?', options: ['Grammar rules', 'Vocabulary', 'Vowel sounds and rhythm', 'Sentence length'], answer: 'Vowel sounds and rhythm' }, { id: 'q2', type: 'fill', question: 'The rise and fall of voice pitch is called ___', answer: 'intonation' }, { id: 'q3', type: 'voice', question: 'Say "I would like a glass of water" in your natural accent.', answer: '' }] },
            { id: 'l-4-2', moduleId: 'mod-4', order: 2, title: 'Fast Speech Patterns', skill: 'listening', level: 'B2', duration: 15, sections: [{ type: 'text', content: 'Native speakers use contractions, linking words, and reductions. "Going to" becomes "gonna", "want to" → "wanna", "out of" → "outta". Words blend: "Did you" → "Didja".' }], vocabulary: [{ word: 'contraction', definition: 'Shortened form of two words', example: '"Don\'t" is a contraction of "do not".' }, { word: 'elision', definition: 'Dropping sounds in connected speech', example: '"Next day" becomes "nex\' day" in fast speech.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What is "gonna" a reduction of?', options: ['gone to', 'going to', 'gonna go', 'go on'], answer: 'going to' }, { id: 'q2', type: 'fill', question: '"Did you eat?" sounds like "___ eat?" in fast speech.', answer: 'Didja' }, { id: 'q3', type: 'voice', question: 'Say "I want to go out of here" using fast speech patterns.', answer: '' }] },
            { id: 'l-4-3', moduleId: 'mod-4', order: 3, title: 'Following Lectures & Talks', skill: 'listening', level: 'B2', duration: 20, sections: [{ type: 'text', content: 'Note-taking strategies: Cornell method, mind maps, abbreviations. Signal words show structure: "Firstly" = main point, "However" = contrast, "In conclusion" = summary.' }], vocabulary: [{ word: 'signal word', definition: 'A word indicating structure or transition', example: '"Furthermore" signals an additional point.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What does "however" signal?', options: ['Addition', 'Conclusion', 'Contrast', 'Example'], answer: 'Contrast' }, { id: 'q2', type: 'fill', question: '"___ conclusion, climate change requires immediate action."', answer: 'In' }, { id: 'q3', type: 'voice', question: 'Summarize the main points of this lesson.', answer: '' }] },
            { id: 'l-4-4', moduleId: 'mod-4', order: 4, title: 'Phone & Video Call English', skill: 'listening', level: 'B1', duration: 12, sections: [{ type: 'text', content: 'Key phrases: "Could you repeat that?" / "I didn\'t quite catch that" / "Could you speak up?" / "You\'re breaking up" / "Let me confirm: you said...?"' }], vocabulary: [{ word: 'clarify', definition: 'To make something easier to understand', example: 'Could you clarify what you mean by that?' }], quiz: [{ id: 'q1', type: 'mcq', question: 'How do you ask someone to repeat politely?', options: ['What?', 'Huh?', 'Could you repeat that?', 'Say again!'], answer: 'Could you repeat that?' }, { id: 'q2', type: 'fill', question: 'You\'re ___ up — I can\'t hear you clearly.', answer: 'breaking' }, { id: 'q3', type: 'voice', question: 'Practice asking for clarification in a phone call.', answer: '' }] },
            { id: 'l-4-5', moduleId: 'mod-4', order: 5, title: 'News & Media English', skill: 'listening', level: 'C1', duration: 20, sections: [{ type: 'text', content: 'News English uses formal vocabulary, passive voice, and specific patterns: "Officials say...", "It is reported that...", "According to sources...". Practice with BBC or NPR.' }], vocabulary: [{ word: 'correspondent', definition: 'A journalist reporting from a specific location', example: 'Our correspondent in Delhi reports...' }], quiz: [{ id: 'q1', type: 'mcq', question: 'Which phrase is typical in news?', options: ['They said stuff', 'According to sources...', 'People are saying', 'Everybody knows'], answer: 'According to sources...' }, { id: 'q2', type: 'fill', question: 'It is ___ that the policy will change next year.', answer: 'reported' }, { id: 'q3', type: 'voice', question: 'Report on a recent news event like a TV journalist.', answer: '' }] },
        ]
    },
    {
        id: 'mod-5',
        title: 'Advanced Fluency',
        description: 'Idioms, phrasal verbs, nuance and cultural context',
        icon: '🚀',
        lessons: [
            { id: 'l-5-1', moduleId: 'mod-5', order: 1, title: 'Common Idioms', skill: 'speaking', level: 'B2', duration: 15, sections: [{ type: 'text', content: 'Idioms are fixed expressions with non-literal meanings. "Break a leg" = good luck. "Hit the nail on the head" = be exactly right. "Under the weather" = feeling ill.' }, { type: 'example', content: '"You\'ve really hit the nail on the head with that analysis." / "I can\'t come in today — I\'m feeling a bit under the weather."' }], vocabulary: [{ word: 'idiom', definition: 'An expression whose meaning differs from literal words', example: '"Piece of cake" means something easy.' }, { word: 'context', definition: 'The situation in which words are used', example: 'Understanding context helps interpret idioms.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What does "under the weather" mean?', options: ['Outside', 'Feeling ill', 'In the rain', 'Very happy'], answer: 'Feeling ill' }, { id: 'q2', type: 'fill', question: 'You\'ve ___ the nail on the head!', answer: 'hit' }, { id: 'q3', type: 'voice', question: 'Use 2 idioms in a sentence about your week.', answer: '' }] },
            { id: 'l-5-2', moduleId: 'mod-5', order: 2, title: 'Phrasal Verbs', skill: 'speaking', level: 'B2', duration: 15, sections: [{ type: 'text', content: 'Phrasal verbs combine a verb + preposition/adverb. "Give up" = quit. "Put off" = postpone. "Look into" = investigate. "Come across" = find unexpectedly.' }], vocabulary: [{ word: 'phrasal verb', definition: 'A verb combined with a particle to create new meaning', example: '"Give up" means to stop trying.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What does "put off" mean?', options: ['Discard', 'Postpone', 'Turn off', 'Arrange'], answer: 'Postpone' }, { id: 'q2', type: 'fill', question: 'I need to ___ into this issue more carefully.', answer: 'look' }, { id: 'q3', type: 'voice', question: 'Describe your day using 3 phrasal verbs.', answer: '' }] },
            { id: 'l-5-3', moduleId: 'mod-5', order: 3, title: 'Formal vs Informal Register', skill: 'writing', level: 'B2', duration: 15, sections: [{ type: 'text', content: 'Register = the level of formality. Formal: "I would like to inquire about..." Informal: "I was wondering about..." Slang: "What\'s the deal with...?" Match register to your audience.' }], vocabulary: [{ word: 'register', definition: 'The level of formality in language', example: 'Use formal register in job applications.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'Which is formal?', options: ['Wanna know more?', 'I would like to inquire', 'What\'s up?', 'Hit me up'], answer: 'I would like to inquire' }, { id: 'q2', type: 'fill', question: 'Please do not ___ to contact us. (formal for "hesitate")', answer: 'hesitate' }, { id: 'q3', type: 'voice', question: 'Say the same message in formal and informal ways.', answer: '' }] },
            { id: 'l-5-4', moduleId: 'mod-5', order: 4, title: 'British vs American English', skill: 'reading', level: 'B1', duration: 12, sections: [{ type: 'text', content: 'Key differences: Spelling (colour/color, analyse/analyze), Vocabulary (lift/elevator, boot/trunk, biscuit/cookie), Dates (DD/MM/YYYY vs MM/DD/YYYY).' }], vocabulary: [{ word: 'dialect', definition: 'A regional variety of a language', example: 'American English is a dialect of English.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What is "lift" in American English?', options: ['Stairs', 'Elevator', 'Escalator', 'Ramp'], answer: 'Elevator' }, { id: 'q2', type: 'fill', question: 'The British spelling is "_____ise" while Americans write "_____ize" (e.g., organise/organize).', answer: 'organise / organize' }, { id: 'q3', type: 'voice', question: 'Name 3 British English words and their American equivalents.', answer: '' }] },
            { id: 'l-5-5', moduleId: 'mod-5', order: 5, title: 'Humour & Sarcasm in English', skill: 'speaking', level: 'C1', duration: 15, sections: [{ type: 'text', content: 'English humour often uses understatement, irony, and self-deprecation. Sarcasm says the opposite of what is meant. Context and tone are essential. "Oh great, another Monday!" = ironic.' }], vocabulary: [{ word: 'sarcasm', definition: 'Saying the opposite of what you mean, often mockingly', example: '"Oh brilliant!" said sarcastically means the opposite.' }, { word: 'understatement', definition: 'Describing something as less significant than it is', example: '"It\'s a bit chilly" in a snowstorm is understatement.' }], quiz: [{ id: 'q1', type: 'mcq', question: 'What is understatement?', options: ['Exaggerating', 'Speaking slowly', 'Describing something as less significant', 'Using big words'], answer: 'Describing something as less significant' }, { id: 'q2', type: 'fill', question: 'Saying "not bad" when something is amazing is ___', answer: 'understatement' }, { id: 'q3', type: 'voice', question: 'Tell a short joke or use irony in a sentence.', answer: '' }] },
        ]
    },
]

// Flatten all lessons for easy lookup
export const ALL_LESSONS: Lesson[] = MODULES.flatMap(m => m.lessons)

export function getLessonById(id: string): Lesson | undefined {
    return ALL_LESSONS.find(l => l.id === id)
}

export function getModuleById(id: string): Module | undefined {
    return MODULES.find(m => m.id === id)
}
