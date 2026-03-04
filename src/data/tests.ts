export interface TestQuestion {
    id: string
    type: 'mcq' | 'fill' | 'voice' | 'writing'
    question: string
    options?: string[]
    answer: string // correct answer or reference answer for AI grading
}

export const CHECKPOINT_TEST: TestQuestion[] = [
    { id: 'cp1', type: 'mcq', question: 'Choose the correct greeting for a formal email:', options: ['Hey there,', 'Dear Siri,', 'Dear Hiring Manager,', 'What\'s up,'], answer: 'Dear Hiring Manager,' },
    { id: 'cp2', type: 'mcq', question: 'Which sentence is grammatically correct?', options: ['She go to the store.', 'She goes to the store.', 'She going to the store.', 'She gone to the store.'], answer: 'She goes to the store.' },
    { id: 'cp3', type: 'fill', question: 'I am looking ___ to our meeting tomorrow. (forward/for/at)', answer: 'forward' },
    { id: 'cp4', type: 'mcq', question: 'What does "ASAP" stand for?', options: ['As Soon As Possible', 'Always Say A Prayer', 'As Slow As Possible', 'All Systems Are Perfect'], answer: 'As Soon As Possible' },
    { id: 'cp5', type: 'fill', question: 'Please ___ the document to this email. (attach/join)', answer: 'attach' },
    { id: 'cp6', type: 'mcq', question: 'A "deadline" is:', options: ['A literal line you cannot cross', 'The time by which something must be finished', 'A dead phone line', 'A broken string'], answer: 'The time by which something must be finished' },
    { id: 'cp7', type: 'fill', question: 'We need to think outside the ___. (box/cube)', answer: 'box' },
    { id: 'cp8', type: 'mcq', question: 'To "touch base" means to:', options: ['Play baseball', 'Briefly make or renew contact with someone', 'Touch the floor', 'Check the foundation'], answer: 'Briefly make or renew contact with someone' },
    { id: 'cp9', type: 'fill', question: 'Could you please let me ___ if you can make it? (know/tell)', answer: 'know' },
    { id: 'cp10', type: 'mcq', question: 'Which is a polite way to disagree?', options: ['You are wrong.', 'That\'s stupid.', 'I see your point, but...', 'No way.'], answer: 'I see your point, but...' },
    { id: 'cp11', type: 'mcq', question: 'What does "CC" stand for in an email?', options: ['Carbon Copy', 'Cool Cat', 'Central Control', 'Create Copy'], answer: 'Carbon Copy' },
    { id: 'cp12', type: 'fill', question: 'I will get back ___ you tomorrow. (to/at)', answer: 'to' },
    { id: 'cp13', type: 'mcq', question: 'To "wrap up" a meeting means:', options: ['To give someone a gift', 'To finish or conclude it', 'To put on a coat', 'To start over'], answer: 'To finish or conclude it' },
    { id: 'cp14', type: 'fill', question: 'Can we ___ a meeting for next week? (schedule/make)', answer: 'schedule' },
    { id: 'cp15', type: 'voice', question: 'Please introduce yourself and your current role briefly.', answer: '' },
]

export const WEEKLY_TEST: TestQuestion[] = [
    ...CHECKPOINT_TEST.slice(0, 4), // Mix of some previous questions
    { id: 'w1', type: 'mcq', question: 'It is important to ___ deadlines carefully.', options: ['meet', 'see', 'catch', 'do'], answer: 'meet' },
    { id: 'w2', type: 'fill', question: 'Please ___ sure you save your work. (make/do)', answer: 'make' },
    { id: 'w3', type: 'mcq', question: 'A "win-win situation" is:', options: ['Everyone loses', 'Only one person wins', 'Advantageous to all parties involved', 'A tie game'], answer: 'Advantageous to all parties involved' },
    { id: 'w4', type: 'fill', question: 'Let\'s dive ___ the details. (into/in)', answer: 'into' },
    { id: 'w5', type: 'voice', question: 'Describe a project you recently worked on.', answer: '' },
    { id: 'w6', type: 'writing', question: 'Write a short message (2-3 sentences) to a colleague asking for an update on the Q3 report.', answer: '' },
]

export const LEVEL_UP_TEST: TestQuestion[] = [
    ...CHECKPOINT_TEST.slice(0, 10),
    { id: 'l1', type: 'mcq', question: 'To "streamline" a process means to:', options: ['Make it longer', 'Make it more complex', 'Make it simpler and more efficient', 'Watch it online'], answer: 'Make it simpler and more efficient' },
    { id: 'l2', type: 'fill', question: 'We need to figure ___ a solution. (out/in/up)', answer: 'out' },
    { id: 'l3', type: 'mcq', question: 'Which word means "working together to achieve a goal"?', options: ['Competition', 'Isolation', 'Collaboration', 'Separation'], answer: 'Collaboration' },
    { id: 'l4', type: 'fill', question: 'I look forward to hearing ___ you soon. (from/of/to)', answer: 'from' },
    { id: 'l5', type: 'mcq', question: 'A "bottleneck" in a project is:', options: ['The glass part of a bottle', 'A delay or constraint that slows down progress', 'A type of drink', 'A fast achievement'], answer: 'A delay or constraint that slows down progress' },
    { id: 'l6', type: 'fill', question: 'The meeting has been called ___ because of the storm. (off/out/down)', answer: 'off' },
    { id: 'l7', type: 'voice', question: 'Explain how you handle conflicts in the workplace.', answer: '' },
    { id: 'l8', type: 'writing', question: 'Write a paragraph (50-80 words) describing your professional goals for the next year.', answer: '' },
    // Truncated to 18 questions for demo brevity, representing a larger test.
]
