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
        description: 'Build confidence in daily English interactions and small talk.',
        icon: '💬',
        lessons: [
            {
                id: 'l-1-1', moduleId: 'mod-1', order: 1,
                title: 'Greetings & Introductions', skill: 'speaking', level: 'A1', duration: 10,
                sections: [
                    { type: 'text', content: 'Greetings are the first step in any conversation. In English, we use different greetings depending on the time of day and the formality of the situation. "Good morning", "Good afternoon", and "Good evening" are formal, while "Hi" and "Hey" are casual.' },
                    { type: 'text', content: 'When introducing yourself, always state your name clearly and add a friendly detail. For example: "Hi, I\'m Sara. I work as a designer." This opens the door for further conversation.' },
                    { type: 'example', content: 'Formal: "Good morning! My name is James. It\'s a pleasure to meet you."\nCasual: "Hey! I\'m James. Nice to meet you!"' },
                    { type: 'vocab', content: 'greeting|introduction|formal|casual|pleasure' },
                ],
                vocabulary: [
                    { word: 'greeting', definition: 'A word or phrase used to welcome or acknowledge someone', example: '"Good morning" is a common greeting.' },
                    { word: 'introduction', definition: 'The act of presenting yourself or someone else for the first time', example: 'She made a confident introduction at the meeting.' },
                    { word: 'formal', definition: 'Suitable for official or serious situations', example: 'Use formal language in job interviews.' },
                    { word: 'casual', definition: 'Relaxed and informal in style or manner', example: '"Hey, what\'s up?" is a casual greeting.' },
                    { word: 'pleasure', definition: 'A feeling of happiness or satisfaction', example: '"It\'s a pleasure to meet you" is a polite phrase.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which greeting is most appropriate for a job interview?', options: ['Hey there!', 'Yo!', 'Good morning!', 'Wassup?'], answer: 'Good morning!' },
                    { id: 'q2', type: 'fill', question: '"It\'s a ___ to meet you" is a polite expression.', answer: 'pleasure' },
                    { id: 'q3', type: 'mcq', question: 'Which word describes relaxed, informal language?', options: ['Formal', 'Professional', 'Casual', 'Official'], answer: 'Casual' },
                    { id: 'q4', type: 'fill', question: 'A ___ is a phrase used to welcome someone.', answer: 'greeting' },
                    { id: 'q5', type: 'mcq', question: 'What is the best way to introduce yourself?', options: ['Say only your name', 'Share your name and a friendly detail', 'Stay silent', 'Ask a question first'], answer: 'Share your name and a friendly detail' },
                    { id: 'q6', type: 'fill', question: '"Good morning" is an example of a ___ greeting.', answer: 'formal' },
                    { id: 'q7', type: 'voice', question: 'Introduce yourself as if meeting someone for the first time.', answer: '' },
                ]
            },
            {
                id: 'l-1-2', moduleId: 'mod-1', order: 2,
                title: 'Small Talk & Keeping Conversations Going', skill: 'speaking', level: 'A2', duration: 12,
                sections: [
                    { type: 'text', content: 'Small talk is light, friendly conversation about everyday topics. Common topics include the weather, weekends, food, and local events. Small talk helps build rapport with people before discussing more serious topics.' },
                    { type: 'text', content: 'To keep a conversation going, use follow-up questions and show interest. Instead of just answering, add a detail and ask back. For example: "I went to the park this weekend. It was lovely! What about you?"' },
                    { type: 'example', content: 'A: "Beautiful weather today, isn\'t it?"\nB: "It really is! I actually went for a walk this morning. Do you enjoy outdoor activities?"' },
                    { type: 'vocab', content: 'small talk|rapport|follow-up|topic|engage' },
                ],
                vocabulary: [
                    { word: 'small talk', definition: 'Polite, light conversation about unimportant topics', example: 'We made small talk while waiting for the meeting to start.' },
                    { word: 'rapport', definition: 'A friendly, harmonious relationship', example: 'She quickly built rapport with her new colleagues.' },
                    { word: 'follow-up', definition: 'A question or action that continues or builds on something said', example: 'Ask a follow-up question to show you are listening.' },
                    { word: 'engage', definition: 'To attract and keep someone\'s attention or interest', example: 'A good question can engage anyone in conversation.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What is the main purpose of small talk?', options: ['To discuss politics', 'To build rapport before serious topics', 'To argue a point', 'To give instructions'], answer: 'To build rapport before serious topics' },
                    { id: 'q2', type: 'fill', question: 'A ___ question helps keep the conversation going.', answer: 'follow-up' },
                    { id: 'q3', type: 'mcq', question: 'Which is a good small talk topic?', options: ['Personal finances', 'Weekend plans', 'Controversial politics', 'Private family issues'], answer: 'Weekend plans' },
                    { id: 'q4', type: 'fill', question: 'Building a friendly relationship with someone is called building ___.', answer: 'rapport' },
                    { id: 'q5', type: 'mcq', question: 'After answering a question, what should you do to keep the conversation going?', options: ['Stay silent', 'Walk away', 'Ask a question back', 'Change the subject suddenly'], answer: 'Ask a question back' },
                    { id: 'q6', type: 'fill', question: 'A good question can ___ anyone in a conversation.', answer: 'engage' },
                    { id: 'q7', type: 'voice', question: 'Start a small talk conversation about the weekend with a colleague.', answer: '' },
                ]
            }
        ]
    },
    {
        id: 'mod-2',
        title: 'Grammar Essentials',
        description: 'Master the core grammar rules that power clear English communication.',
        icon: '📖',
        lessons: [
            {
                id: 'l-2-1', moduleId: 'mod-2', order: 1,
                title: 'Tenses: Present & Past', skill: 'writing', level: 'A2', duration: 15,
                sections: [
                    { type: 'text', content: 'English tenses tell us when an action happens. The Simple Present is used for habits and facts (e.g., "She works every day."), while the Simple Past is used for completed actions (e.g., "She worked yesterday.").' },
                    { type: 'text', content: 'The Present Continuous ("She is working right now.") describes actions happening at this moment. Choosing the right tense makes your meaning clear and your English sound natural.' },
                    { type: 'example', content: 'Simple Present: "I drink coffee every morning."\nSimple Past: "I drank coffee this morning."\nPresent Continuous: "I am drinking coffee right now."' },
                    { type: 'vocab', content: 'tense|habit|continuous|completed|action' },
                ],
                vocabulary: [
                    { word: 'tense', definition: 'A form of a verb that shows the time of an action', example: '"Walked" is the past tense of "walk."' },
                    { word: 'habit', definition: 'Something done regularly and repeatedly', example: 'Use the simple present for daily habits.' },
                    { word: 'continuous', definition: 'Happening or going on without stopping', example: '"She is reading" uses the continuous tense.' },
                    { word: 'completed', definition: 'Finished; no longer ongoing', example: 'Use the past tense for completed actions.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which sentence uses the Simple Present correctly?', options: ['She walk to school.', 'She walks to school.', 'She is walked to school.', 'She walked to school yesterday.'], answer: 'She walks to school.' },
                    { id: 'q2', type: 'fill', question: '"I ___ (eat) lunch an hour ago." — Use the correct past tense.', answer: 'ate' },
                    { id: 'q3', type: 'mcq', question: 'Which tense describes what is happening right now?', options: ['Simple Past', 'Simple Present', 'Present Continuous', 'Future Simple'], answer: 'Present Continuous' },
                    { id: 'q4', type: 'fill', question: 'Use the Simple Present for routines and ___.', answer: 'habits' },
                    { id: 'q5', type: 'mcq', question: 'Which sentence is in the Simple Past?', options: ['I run every day.', 'I am running now.', 'I ran to the store.', 'I will run tomorrow.'], answer: 'I ran to the store.' },
                    { id: 'q6', type: 'fill', question: '"She is cooking dinner." uses the Present ___ tense.', answer: 'Continuous' },
                    { id: 'q7', type: 'voice', question: 'Describe your morning routine using the Simple Present tense.', answer: '' },
                ]
            },
            {
                id: 'l-2-2', moduleId: 'mod-2', order: 2,
                title: 'Articles & Prepositions', skill: 'writing', level: 'B1', duration: 15,
                sections: [
                    { type: 'text', content: 'Articles ("a", "an", "the") are small but powerful words. Use "a" or "an" when mentioning something for the first time or when it\'s not specific. Use "the" when both the speaker and listener know what is being referred to.' },
                    { type: 'text', content: 'Prepositions show relationships between words — especially time and place. Common examples: "at" (at 5pm, at the door), "in" (in the morning, in London), "on" (on Monday, on the table).' },
                    { type: 'example', content: 'Articles: "I saw a dog in the park. The dog was very friendly."\nPrepositions: "The meeting is on Monday at 9am in the conference room."' },
                    { type: 'vocab', content: 'article|preposition|specific|relationship|reference' },
                ],
                vocabulary: [
                    { word: 'article', definition: 'A word (a, an, the) used before a noun', example: '"The" is a definite article.' },
                    { word: 'preposition', definition: 'A word that shows the relationship between a noun and other words', example: '"In", "on", and "at" are common prepositions.' },
                    { word: 'specific', definition: 'Clearly defined or identified', example: 'Use "the" when referring to something specific.' },
                    { word: 'reference', definition: 'The act of mentioning or pointing to something', example: '"The book" references a specific book already mentioned.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which article is used for something specific and already known?', options: ['a', 'an', 'the', 'none'], answer: 'the' },
                    { id: 'q2', type: 'fill', question: 'I have ___ appointment at 3pm. (a/an)', answer: 'an' },
                    { id: 'q3', type: 'mcq', question: 'Which preposition is correct: "The party is ___ Friday"?', options: ['in', 'at', 'on', 'by'], answer: 'on' },
                    { id: 'q4', type: 'fill', question: '"She lives ___ London." — Fill in the correct preposition.', answer: 'in' },
                    { id: 'q5', type: 'mcq', question: 'When do you use "an" instead of "a"?', options: ['Before any noun', 'Before a vowel sound', 'Before a consonant sound', 'Before proper nouns'], answer: 'Before a vowel sound' },
                    { id: 'q6', type: 'fill', question: '"The meeting is ___ 9am." — Use the correct preposition.', answer: 'at' },
                    { id: 'q7', type: 'voice', question: 'Describe where you live using at least three prepositions.', answer: '' },
                ]
            }
        ]
    },
    {
        id: 'mod-3',
        title: 'Vocabulary Building',
        description: 'Expand your English with idioms, phrasal verbs, and word families.',
        icon: '🧠',
        lessons: [
            {
                id: 'l-3-1', moduleId: 'mod-3', order: 1,
                title: 'Common Idioms', skill: 'reading', level: 'B1', duration: 15,
                sections: [
                    { type: 'text', content: 'An idiom is a phrase whose meaning cannot be understood from the literal meaning of the individual words. For example, "hit the books" doesn\'t mean physically hitting books — it means to study.' },
                    { type: 'text', content: 'Idioms are widely used in everyday English, movies, podcasts, and workplaces. Learning them helps you understand native speakers and sound more natural yourself.' },
                    { type: 'example', content: '"I\'m under the weather today." → I\'m feeling sick.\n"Let\'s hit the nail on the head." → Let\'s identify the exact problem.\n"She\'s burning the midnight oil." → She\'s working very late.' },
                    { type: 'vocab', content: 'idiom|literal|phrase|context|expression' },
                ],
                vocabulary: [
                    { word: 'idiom', definition: 'A phrase with a meaning different from its literal words', example: '"Break a leg" is an idiom meaning good luck.' },
                    { word: 'literal', definition: 'Taking words in their most basic sense', example: 'The literal meaning of "kick the bucket" is different from its idiomatic one.' },
                    { word: 'expression', definition: 'A word or phrase that conveys a particular idea', example: '"Under the weather" is a common expression for feeling ill.' },
                    { word: 'context', definition: 'The situation in which a word or phrase is used', example: 'You need context to understand many idioms.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What does "hit the books" mean?', options: ['Throw books away', 'Study hard', 'Buy new books', 'Read slowly'], answer: 'Study hard' },
                    { id: 'q2', type: 'fill', question: '"Under the weather" means you are feeling ___.', answer: 'sick' },
                    { id: 'q3', type: 'mcq', question: 'What is an idiom?', options: ['A grammar rule', 'A word with two meanings', 'A phrase with a non-literal meaning', 'A type of sentence'], answer: 'A phrase with a non-literal meaning' },
                    { id: 'q4', type: 'fill', question: 'You need ___ to understand the meaning of an idiom.', answer: 'context' },
                    { id: 'q5', type: 'mcq', question: '"Burning the midnight oil" means:', options: ['Starting a fire', 'Working very late', 'Cooking dinner', 'Wasting energy'], answer: 'Working very late' },
                    { id: 'q6', type: 'fill', question: 'The ___ meaning of an idiom is not the real meaning.', answer: 'literal' },
                    { id: 'q7', type: 'voice', question: 'Use two idioms you know in a short spoken paragraph.', answer: '' },
                ]
            },
            {
                id: 'l-3-2', moduleId: 'mod-3', order: 2,
                title: 'Phrasal Verbs', skill: 'speaking', level: 'B1', duration: 15,
                sections: [
                    { type: 'text', content: 'A phrasal verb is a verb combined with a preposition or adverb that creates a new meaning. For example, "give up" means to stop trying, which is very different from "give."' },
                    { type: 'text', content: 'Phrasal verbs are extremely common in spoken English. Some can be separated ("turn the TV off" / "turn off the TV"), while others cannot ("run into someone" — you cannot say "run someone into").' },
                    { type: 'example', content: '"Can you look after my dog this weekend?" → take care of\n"I ran into my old teacher today." → met by chance\n"Please fill in this form." → complete' },
                    { type: 'vocab', content: 'phrasal verb|particle|separable|inseparable|meaning' },
                ],
                vocabulary: [
                    { word: 'phrasal verb', definition: 'A verb + preposition/adverb combination with a new meaning', example: '"Look up" is a phrasal verb meaning to search for.' },
                    { word: 'particle', definition: 'A preposition or adverb used with a verb to form a phrasal verb', example: '"Off" is the particle in "turn off."' },
                    { word: 'separable', definition: 'A phrasal verb where the object can come between the verb and particle', example: '"Turn it off" is separable.' },
                    { word: 'inseparable', definition: 'A phrasal verb where the parts cannot be split', example: '"Run into" is inseparable.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What does "give up" mean?', options: ['Give a gift', 'Stop trying', 'Give something back', 'Help someone'], answer: 'Stop trying' },
                    { id: 'q2', type: 'fill', question: '"Can you ___ after my cat?" means to take care of it.', answer: 'look' },
                    { id: 'q3', type: 'mcq', question: 'What is a phrasal verb?', options: ['A noun + adjective', 'A verb + particle with a new meaning', 'A formal English phrase', 'A type of idiom only'], answer: 'A verb + particle with a new meaning' },
                    { id: 'q4', type: 'fill', question: '"Run into someone" means to meet them by ___.', answer: 'chance' },
                    { id: 'q5', type: 'mcq', question: 'Which phrasal verb means "to search for information"?', options: ['Look after', 'Look up', 'Look out', 'Look into'], answer: 'Look up' },
                    { id: 'q6', type: 'fill', question: 'A phrasal verb that cannot be split is called ___.', answer: 'inseparable' },
                    { id: 'q7', type: 'voice', question: 'Use three phrasal verbs in sentences about your daily life.', answer: '' },
                ]
            }
        ]
    },
    {
        id: 'mod-4',
        title: 'Career & Communication',
        description: 'Excel in professional environments and job searches.',
        icon: '💼',
        lessons: [
            {
                id: 'l-4-1', moduleId: 'mod-4', order: 1,
                title: 'Professional Email Writing', skill: 'writing', level: 'B2', duration: 15,
                sections: [
                    { type: 'text', content: 'Effective professional emails are clear, concise, and respectful. They should always have a specific subject line, a formal greeting, a focused body, and a professional closing.' },
                    { type: 'text', content: 'Common phrases for opening include "I hope this email finds you well" or "Following up on our meeting." For closings, use "Best regards" or "Sincerely."' },
                    { type: 'example', content: 'Subject: Regarding the Frontend Developer Interview\n\nDear Mr. Smith,\n\nI hope you are having a productive week. I am writing to follow up on my interview from last Tuesday...' },
                    { type: 'vocab', content: 'concise|professional|follow-up|salutation|recipient' },
                ],
                vocabulary: [
                    { word: 'concise', definition: 'Giving a lot of information clearly and in a few words', example: 'Please keep your report concise and to the point.' },
                    { word: 'salutation', definition: 'A standard formula of words used in a letter or email', example: '"Dear Team" is a common professional salutation.' },
                    { word: 'recipient', definition: 'A person who receives something', example: 'Always address the recipient by name if possible.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What is the most important part of an email\'s first impression?', options: ['The font size', 'The subject line', 'The attachments', 'The color of the text'], answer: 'The subject line' },
                    { id: 'q2', type: 'fill', question: 'Keeping an email ___ means being brief but clear.', answer: 'concise' },
                    { id: 'q3', type: 'mcq', question: 'Which is a professional closing?', options: ['See ya', 'Best regards', 'Bye bye', 'Whatever'], answer: 'Best regards' },
                    { id: 'q4', type: 'fill', question: 'A ___ email is sent after a meeting or event.', answer: 'follow-up' },
                    { id: 'q5', type: 'mcq', question: 'What should you use if you don\'t know the recipient\'s name?', options: ['Hi friend', 'To whom it may concern', 'Hey you', 'Greetings human'], answer: 'To whom it may concern' },
                    { id: 'q6', type: 'fill', question: 'The greeting in an email is called a ___.', answer: 'salutation' },
                    { id: 'q7', type: 'voice', question: 'Draft a short subject line for a job application.', answer: '' },
                ]
            },
            {
                id: 'l-4-2', moduleId: 'mod-4', order: 2,
                title: 'Job Interview English', skill: 'speaking', level: 'B2', duration: 20,
                sections: [
                    { type: 'text', content: 'Job interviews require a balance of confidence and evidence. Use the "STAR" method (Situation, Task, Action, Result) to answer behavioral questions effectively.' },
                    { type: 'text', content: 'Prepare for common questions: "What is your biggest weakness?", "Why do you want to work here?", and "Tell me about a challenge you overcame."' },
                    { type: 'example', content: 'Interviewer: "Tell me about a challenge you faced."\nCandidate: "In my last role (Situation), our team missed a deadline (Task). I reorganized our workflow (Action) and we delivered the project within the next sprint (Result)."' },
                    { type: 'vocab', content: 'behavioral|weakness|candidate|strengths|outcome' },
                ],
                vocabulary: [
                    { word: 'behavioral', definition: 'Questions about how you acted in past situations', example: 'Behavioral interviews are standard in most companies.' },
                    { word: 'outcome', definition: 'The final result or consequence', example: 'What was the outcome of your research?' },
                    { word: 'candidate', definition: 'A person applying for a job or position', example: 'The candidate answered every question confidently.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What does the "A" in STAR stand for?', options: ['Ability', 'Action', 'Argument', 'Account'], answer: 'Action' },
                    { id: 'q2', type: 'fill', question: 'The final result in STAR is the ___.', answer: 'outcome' },
                    { id: 'q3', type: 'mcq', question: 'How should you discuss a weakness?', options: ['Deny having any', 'Blame others', 'Show how you are improving it', 'Say it\'s perfectionism'], answer: 'Show how you are improving it' },
                    { id: 'q4', type: 'fill', question: 'The person applying for the job is the ___.', answer: 'candidate' },
                    { id: 'q5', type: 'mcq', question: 'Which STAR part describes the context?', options: ['Situation', 'Task', 'Action', 'Result'], answer: 'Situation' },
                    { id: 'q6', type: 'fill', question: '___ questions ask about your past experiences.', answer: 'behavioral' },
                    { id: 'q7', type: 'voice', question: 'Introduce yourself as if starting an interview.', answer: '' },
                ]
            }
        ]
    },
    {
        id: 'mod-5',
        title: 'Fluency & Expression',
        description: 'Express opinions, tell stories, and speak with confidence.',
        icon: '🚀',
        lessons: [
            {
                id: 'l-5-1', moduleId: 'mod-5', order: 1,
                title: 'Giving Your Opinion', skill: 'speaking', level: 'B2', duration: 15,
                sections: [
                    { type: 'text', content: 'Expressing opinions clearly is a key fluency skill. Use phrases like "In my opinion...", "I believe that...", or "From my perspective..." to introduce your view politely and confidently.' },
                    { type: 'text', content: 'To show you have considered other views, use phrases like "While I understand that...", "I see where you\'re coming from, but...", or "That\'s a valid point, however..." This shows maturity in communication.' },
                    { type: 'example', content: '"In my opinion, remote work increases productivity."\n"I see your point about office collaboration, but I believe flexibility is more important for most people."' },
                    { type: 'vocab', content: 'perspective|opinion|acknowledge|argue|viewpoint' },
                ],
                vocabulary: [
                    { word: 'perspective', definition: 'A particular way of thinking about something', example: 'From my perspective, the solution is quite simple.' },
                    { word: 'acknowledge', definition: 'To recognize or accept the truth of something', example: 'She acknowledged his point before sharing her own.' },
                    { word: 'viewpoint', definition: 'A particular attitude or way of seeing something', example: 'Hearing different viewpoints helps you think critically.' },
                    { word: 'argue', definition: 'To give reasons for or against something', example: 'He argued that the policy needed to be changed.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'Which phrase best introduces an opinion?', options: ['You are wrong.', 'From my perspective...', 'Everybody knows that...', 'Obviously...'], answer: 'From my perspective...' },
                    { id: 'q2', type: 'fill', question: '"I see your ___, but I disagree." acknowledges another view.', answer: 'point' },
                    { id: 'q3', type: 'mcq', question: 'Why is it important to acknowledge other viewpoints?', options: ['To confuse people', 'To show maturity and open-mindedness', 'To avoid the question', 'To seem uncertain'], answer: 'To show maturity and open-mindedness' },
                    { id: 'q4', type: 'fill', question: '"In my ___" is a common way to share a personal view.', answer: 'opinion' },
                    { id: 'q5', type: 'mcq', question: 'Which phrase politely disagrees?', options: ['That\'s totally wrong.', 'I disagree because you\'re dumb.', 'That\'s a valid point, however...', 'No way!'], answer: 'That\'s a valid point, however...' },
                    { id: 'q6', type: 'fill', question: 'Looking at things from different angles means considering different ___.', answer: 'perspectives' },
                    { id: 'q7', type: 'voice', question: 'Share your opinion on whether English should be taught in all schools globally.', answer: '' },
                ]
            },
            {
                id: 'l-5-2', moduleId: 'mod-5', order: 2,
                title: 'Storytelling in English', skill: 'speaking', level: 'C1', duration: 20,
                sections: [
                    { type: 'text', content: 'Good storytelling keeps listeners engaged. Every story needs three things: a setting (when and where), a conflict (what went wrong or what the challenge was), and a resolution (how it ended or what you learned).' },
                    { type: 'text', content: 'Use sequence words to guide your listener: "First...", "Then...", "After that...", "Eventually...", "Finally...". Also add descriptive language and emotion to make your story vivid and memorable.' },
                    { type: 'example', content: '"Last summer, I got lost in a city I had never visited before. (Setting) I couldn\'t find my hotel and my phone battery was dead. (Conflict) Eventually, a kind stranger helped me find my way, and I ended up having the best evening of the trip. (Resolution)"' },
                    { type: 'vocab', content: 'setting|conflict|resolution|sequence|vivid' },
                ],
                vocabulary: [
                    { word: 'setting', definition: 'The time and place where a story occurs', example: 'The setting of her story was a small coastal town.' },
                    { word: 'conflict', definition: 'The central challenge or problem in a story', example: 'Every good story has a conflict that needs to be resolved.' },
                    { word: 'resolution', definition: 'The way a conflict is solved or concluded', example: 'The resolution surprised everyone in the audience.' },
                    { word: 'sequence', definition: 'A particular order in which related things follow each other', example: 'Use sequence words like "first" and "then" in storytelling.' },
                    { word: 'vivid', definition: 'Producing powerful feelings or strong images in the mind', example: 'Her vivid description made the story come alive.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What are the three essential parts of a good story?', options: ['Title, body, conclusion', 'Setting, conflict, resolution', 'Introduction, grammar, ending', 'Characters, vocabulary, moral'], answer: 'Setting, conflict, resolution' },
                    { id: 'q2', type: 'fill', question: '"___, I heard a strange noise, then everything went quiet." — Use a sequence word.', answer: 'First' },
                    { id: 'q3', type: 'mcq', question: 'What does "resolution" mean in a story?', options: ['The beginning of events', 'The main character\'s name', 'How the conflict is solved', 'The most exciting moment'], answer: 'How the conflict is solved' },
                    { id: 'q4', type: 'fill', question: 'A ___ description uses strong images to bring a story to life.', answer: 'vivid' },
                    { id: 'q5', type: 'mcq', question: 'Which word best connects two events in sequence?', options: ['However', 'Although', 'Then', 'Despite'], answer: 'Then' },
                    { id: 'q6', type: 'fill', question: 'The time and place in a story is called the ___.', answer: 'setting' },
                    { id: 'q7', type: 'voice', question: 'Tell a 1-minute story about an interesting or funny thing that happened to you.', answer: '' },
                ]
            }
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