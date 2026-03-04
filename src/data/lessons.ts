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
        title: 'Software Foundations',
        description: 'Learn to describe the core concepts of programming in English.',
        icon: '💻',
        lessons: [
            {
                id: 'l-1-1', moduleId: 'mod-1', order: 1,
                title: 'What is Programming?', skill: 'speaking', level: 'A1', duration: 10,
                sections: [
                    { type: 'text', content: 'Programming is the process of creating a set of instructions that tell a computer how to perform a task. It allows us to automate repetitive actions and solve complex problems using logic.' },
                    { type: 'text', content: 'When we write code, we use specific languages like Python, JavaScript, or C++. These languages act as a bridge between human logic and machine execution.' },
                    { type: 'example', content: '// Example: A simple instruction to the computer\nconsole.log("Hello, World!");\n// This line tells the computer to display a message.' },
                    { type: 'vocab', content: 'automate|instruction|logic|execution|complex' },
                ],
                vocabulary: [
                    { word: 'automate', definition: 'To make a process operate automatically', example: 'We can automate data entry with a simple script.' },
                    { word: 'instruction', definition: 'An order or detailed direction to be followed', example: 'The CPU follows every instruction in the program.' },
                    { word: 'logic', definition: 'Reasoning conducted according to strict principles of validity', example: 'Your code fails because the logic is flawed.' },
                    { word: 'execution', definition: 'The process of a computer performing instructions', example: 'Wait for the execution of the command to finish.' },
                    { word: 'complex', definition: 'Not easy to analyze or understand; complicated', example: 'Building a search engine is a very complex task.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What is the primary goal of programming?', options: ['To make computers look pretty', 'To give instructions to a computer', 'To play video games', 'To fix hardware'], answer: 'To give instructions to a computer' },
                    { id: 'q2', type: 'fill', question: 'Programming allows us to ___ repetitive tasks.', answer: 'automate' },
                    { id: 'q3', type: 'mcq', question: 'What acts as a bridge between human logic and machines?', options: ['Programming languages', 'The keyboard', 'Electricity', 'The monitor'], answer: 'Programming languages' },
                    { id: 'q4', type: 'fill', question: 'Code follows human ___ and machine execution.', answer: 'logic' },
                    { id: 'q5', type: 'mcq', question: '"Hello World" is an example of a simple ___?', options: ['Hardware', 'Instruction', 'Monitor', 'Memory'], answer: 'Instruction' },
                    { id: 'q6', type: 'fill', question: 'Solving ___ problems is a key part of coding.', answer: 'complex' },
                    { id: 'q7', type: 'voice', question: 'Define programming in your own words.', answer: '' },
                ]
            },
            {
                id: 'l-1-2', moduleId: 'mod-1', order: 2,
                title: 'Variables & Data Types', skill: 'speaking', level: 'A1', duration: 12,
                sections: [
                    { type: 'text', content: 'Variables are containers for storing data values. Imagine a variable as a labeled box where you can put information like numbers, text, or true/false values.' },
                    { type: 'text', content: 'Data types define what kind of data the variable holds. Common types include Strings (for text), Integers (for whole numbers), and Booleans (for true/false).' },
                    { type: 'example', content: '// Variables in JavaScript\nlet userName = "Nova"; // String\nlet userLevel = 5;      // Integer\nlet isLogged = true;    // Boolean' },
                    { type: 'vocab', content: 'variable|container|data type|string|boolean' },
                ],
                vocabulary: [
                    { word: 'variable', definition: 'A symbolic name associated with a value', example: 'Assign the user\'s age to a variable.' },
                    { word: 'string', definition: 'A sequence of characters used to represent text', example: '"Welcome" is a string data type.' },
                    { word: 'boolean', definition: 'A data type that has one of two possible values: true or false', example: 'The isFinished variable is a boolean.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What is a variable?', options: ['A computer screen', 'A container for storing data', 'A type of keyboard', 'A physical box'], answer: 'A container for storing data' },
                    { id: 'q2', type: 'fill', question: 'A ___ data type represents text.', answer: 'string' },
                    { id: 'q3', type: 'mcq', question: 'Which data type represents true or false?', options: ['Integer', 'Float', 'Boolean', 'Character'], answer: 'Boolean' },
                    { id: 'q4', type: 'fill', question: 'Variables are like labeled ___ for information.', answer: 'boxes' },
                    { id: 'q5', type: 'mcq', question: 'What kind of data type is the number 25?', options: ['String', 'Integer', 'Boolean', 'Null'], answer: 'Integer' },
                    { id: 'q6', type: 'fill', question: '___ define what kind of data a variable holds.', answer: 'data types' },
                    { id: 'q7', type: 'voice', question: 'Explain why we use variables in code.', answer: '' },
                ]
            }
        ]
    },
    {
        id: 'mod-2',
        title: 'Logic & Control Flow',
        description: 'Master the language of decision-making and iteration.',
        icon: '⚙️',
        lessons: [
            {
                id: 'l-2-1', moduleId: 'mod-2', order: 1,
                title: 'Print & Input', skill: 'reading', level: 'A2', duration: 12,
                sections: [
                    { type: 'text', content: 'Output and input are the most basic ways for a program to interact with the world. "Print" allows the program to send information to the user, while "Input" allows the program to receive information.' },
                    { type: 'text', content: 'In Python, we use print() for output and input() for user feedback. Understanding this flow is essential for debugging and user interface design.' },
                    { type: 'example', content: '# Python example\nname = input("Enter your name: ")\nprint("Hello, " + name)' },
                    { type: 'vocab', content: 'output|input|interact|feedback|prompt' },
                ],
                vocabulary: [
                    { word: 'output', definition: 'Data sent out from a system', example: 'The output of the function was correct.' },
                    { word: 'input', definition: 'Data provided to a system', example: 'The user input was invalid.' },
                    { word: 'prompt', definition: 'A message that asks the user for input', example: 'The prompt asked for a password.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What does "print" do?', options: ['Deletes files', 'Sends information to the user', 'Saves the program', 'Shuts down the PC'], answer: 'Sends information to the user' },
                    { id: 'q2', type: 'fill', question: 'The system receives data through ___?', answer: 'input' },
                    { id: 'q3', type: 'mcq', question: 'What is a message that asks for user input called?', options: ['Print', 'Prompt', 'Boolean', 'Variable'], answer: 'Prompt' },
                    { id: 'q4', type: 'fill', question: '___ is data sent out from the system.', answer: 'output' },
                    { id: 'q5', type: 'mcq', question: 'If you want to know a user\'s age, you use ___?', options: ['Output', 'Input', 'Delete', 'Stop'], answer: 'Input' },
                    { id: 'q6', type: 'fill', question: 'Output and input help the program to ___ with the user.', answer: 'interact' },
                    { id: 'q7', type: 'voice', question: 'Describe an interaction where a program uses both input and output.', answer: '' },
                ]
            },
            {
                id: 'l-2-2', moduleId: 'mod-2', order: 2,
                title: 'Loops & Iteration', skill: 'writing', level: 'A2', duration: 15,
                sections: [
                    { type: 'text', content: 'Iteration is the process of repeating a specific block of code multiple times. This is done using loops, such as "for" loops and "while" loops.' },
                    { type: 'text', content: 'Loops are powerful because they save developers from writing the same code over and over again. They continue until a specific condition is met.' },
                    { type: 'example', content: '// JavaScript for loop\nfor (let i = 0; i < 5; i++) {\n  console.log("Iteration number: " + i);\n}' },
                    { type: 'vocab', content: 'iteration|loop|condition|continuous|repetition' },
                ],
                vocabulary: [
                    { word: 'iteration', definition: 'The repetition of a process', example: 'Each iteration of the loop updates the score.' },
                    { word: 'condition', definition: 'A state that must be met to continue or stop', example: 'The loop stops when the condition i < 5 is false.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What is iteration?', options: ['Deleting code', 'Repeating a block of code', 'Renaming variables', 'Closing the browser'], answer: 'Repeating a block of code' },
                    { id: 'q2', type: 'fill', question: 'A ___ loop repeats while a condition is true.', answer: 'while' },
                    { id: 'q3', type: 'mcq', question: 'Why do we use loops?', options: ['To make code longer', 'To avoid repetitive manual coding', 'To make the computer slower', 'To change colors'], answer: 'To avoid repetitive manual coding' },
                    { id: 'q4', type: 'fill', question: 'A loop continues until a ___ is met.', answer: 'condition' },
                    { id: 'q5', type: 'mcq', question: 'Which of these is a common loop type?', options: ['if', 'for', 'else', 'const'], answer: 'for' },
                    { id: 'q6', type: 'fill', question: 'Each round of a loop is called an ___.', answer: 'iteration' },
                    { id: 'q7', type: 'voice', question: 'Explain how a loop might be used to send emails to 100 people.', answer: '' },
                ]
            }
        ]
    },
    {
        id: 'mod-3',
        title: 'Building Blocks',
        description: 'Learn to structure code with conditions and functions.',
        icon: '🧱',
        lessons: [
            {
                id: 'l-3-1', moduleId: 'mod-3', order: 1,
                title: 'If/Else Statements', skill: 'reading', level: 'B1', duration: 15,
                sections: [
                    { type: 'text', content: 'If/Else statements are the primary tool for decision-making in code. They allow the program to execute one path if a condition is true, and potentially another if it is false.' },
                    { type: 'text', content: 'We use comparison operators like "equal to" (==), "not equal to" (!=), "greater than" (>), and "less than" (<) to form these conditions.' },
                    { type: 'example', content: '// If/Else example\nlet score = 85;\nif (score >= 70) {\n  console.log("You passed!");\n} else {\n  console.log("Try again.");\n}' },
                    { type: 'vocab', content: 'conditional|statement|comparison|execute|alternative' },
                ],
                vocabulary: [
                    { word: 'conditional', definition: 'Subject to one or more requirements being met', example: 'Logic gates are the basis of conditional code.' },
                    { word: 'execute', definition: 'To run or perform a piece of code', example: 'The else block will execute if the condition is false.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What happens if an "if" condition is false?', options: ['The program crashes', 'The "else" block executes', 'The computer restarts', 'The data is deleted'], answer: 'The "else" block executes' },
                    { id: 'q2', type: 'fill', question: 'We use ___ operators like > or < to test values.', answer: 'comparison' },
                    { id: 'q3', type: 'mcq', question: 'Which operator means "not equal to"?', options: ['==', '=', '!=', '>='], answer: '!=' },
                    { id: 'q4', type: 'fill', question: 'If/Else allows for ___ making in code.', answer: 'decision' },
                    { id: 'q5', type: 'mcq', question: 'Which block runs if the condition is true?', options: ['if', 'else', 'while', 'for'], answer: 'if' },
                    { id: 'q6', type: 'fill', question: 'A path that runs when the first condition fails is the ___ path.', answer: 'alternative' },
                    { id: 'q7', type: 'voice', question: 'Describe a real-life "if/else" situation (e.g., waking up for an alarm).', answer: '' },
                ]
            },
            {
                id: 'l-3-2', moduleId: 'mod-3', order: 2,
                title: 'Functions', skill: 'speaking', level: 'B1', duration: 15,
                sections: [
                    { type: 'text', content: 'A function is a reusable block of code that performs a specific task. We "define" a function once and "call" it whenever we need that task performed.' },
                    { type: 'text', content: 'Functions can take "parameters" (inputs) and "return" a value (output). This encourages modularity and clean code architecture.' },
                    { type: 'example', content: '// Defining a function\nfunction greetUser(name) {\n  return "Hello, " + name + "!";\n}\n\n// Calling the function\nconsole.log(greetUser("Alex"));' },
                    { type: 'vocab', content: 'define|call|parameter|return|modular' },
                ],
                vocabulary: [
                    { word: 'modular', definition: 'Composed of separate, exchangeable components', example: 'Functions help keep your code modular and organized.' },
                    { word: 'parameter', definition: 'A value passed to a function to customize its behavior', example: 'The "name" parameter is required for this function.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What is a primary benefit of using functions?', options: ['They make code harder to read', 'They allow for code reuse', 'They increase memory usage', 'They require more typing'], answer: 'They allow for code reuse' },
                    { id: 'q2', type: 'fill', question: 'We ___ a function to run its code.', answer: 'call' },
                    { id: 'q3', type: 'mcq', question: 'What are inputs to a function called?', options: ['Variables', 'Returns', 'Parameters', 'Calls'], answer: 'Parameters' },
                    { id: 'q4', type: 'fill', question: 'A function can ___ a value back after finishing.', answer: 'return' },
                    { id: 'q5', type: 'mcq', question: 'Which term describes code broken into small, separate pieces?', options: ['Monolithic', 'Modular', 'Static', 'Complex'], answer: 'Modular' },
                    { id: 'q6', type: 'fill', question: 'You must ___ a function before you can use it.', answer: 'define' },
                    { id: 'q7', type: 'voice', question: 'If you built a calculator, what functions would you create?', answer: '' },
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
                    { type: 'text', content: 'Prepare for common questions: "What is your biggest weakness?", "Why do you want to work here?", and "Tell me about a time you solved a technical problem."' },
                    { type: 'example', content: 'Interviewer: "Tell me about a bug you fixed."\nCandidate: "In my last project (Situation), we had a memory leak (Task). I used Chrome DevTools to trace it (Action) and reduced usage by 30% (Result)."' },
                    { type: 'vocab', content: 'behavioral|weakness|candidate|strengths|outcome' },
                ],
                vocabulary: [
                    { word: 'behavioral', definition: 'Questions about how you acted in past situations', example: 'Behavioral interviews are standard in Big Tech.' },
                    { word: 'outcome', definition: 'The final result or consequence', example: 'What was the outcome of your research?' },
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
        title: 'Social & Industry Presence',
        description: 'Stand out in the tech community and networking events.',
        icon: '🚀',
        lessons: [
            {
                id: 'l-5-1', moduleId: 'mod-5', order: 1,
                title: 'Self Introduction', skill: 'speaking', level: 'B1', duration: 15,
                sections: [
                    { type: 'text', content: 'A strong self-introduction in tech should cover: who you are, what you build, and what you are learning. Keep it under 60 seconds.' },
                    { type: 'text', content: 'Try to mention your stack (e.g., "MERN stack", "Python developer") and your current focus to make it relevant to other engineers.' },
                    { type: 'example', content: '"Hi everyone! I\'m David, a Full Stack Developer specializing in React and Node.js. Currently, I\'m diving deep into Cloud Architecture and AWS."' },
                    { type: 'vocab', content: 'elevat pitch|specializing|stack|passion|current focus' },
                ],
                vocabulary: [
                    { word: 'stack', definition: 'The set of technologies used in a project', example: 'Our backend stack includes PostgreSQL and Go.' },
                    { word: 'passion', definition: 'Strong and barely controllable emotion', example: 'His passion for open source is inspiring.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What is a "tech stack"?', options: ['A literal stack of books', 'A collection of technologies used', 'A problem with the monitor', 'A type of battery'], answer: 'A collection of technologies used' },
                    { id: 'q2', type: 'fill', question: 'A short intro is often called an ___ pitch.', answer: 'elevator' },
                    { id: 'q3', type: 'mcq', question: 'What should you mention to be relevant in tech?', options: ['Your Favorite food', 'Your technology stack', 'Your pet\'s name', 'Your childhood home'], answer: 'Your technology stack' },
                    { id: 'q4', type: 'fill', question: 'Mentioning what you are ___ shows a growth mindset.', answer: 'learning' },
                    { id: 'q5', type: 'mcq', question: 'How long should a casual self-intro be?', options: ['5 seconds', '30-60 seconds', '10 minutes', '1 hour'], answer: '30-60 seconds' },
                    { id: 'q6', type: 'fill', question: 'If you focus on one area, you are ___ in it.', answer: 'specializing' },
                    { id: 'q7', type: 'voice', question: 'Give a 30-second introduction to a potential mentor.', answer: '' },
                ]
            },
            {
                id: 'l-5-2', moduleId: 'mod-5', order: 2,
                title: 'Explaining Your Project', skill: 'speaking', level: 'B2', duration: 20,
                sections: [
                    { type: 'text', content: 'When explaining a project, focus on: The Problem, Your Solution, and The Impact. Avoid getting too deep into tiny code details unless asked.' },
                    { type: 'text', content: 'Use phrases like "The core challenge was...", "I implemented...", and "The result was a...". Be ready to discuss trade-offs (why you chose one tool over another).' },
                    { type: 'example', content: '"I built a task manager to help teams stay synchronized (Problem). I used WebSockets for real-time updates (Solution), which increased efficiency by 15% (Impact)."' },
                    { type: 'vocab', content: 'efficiency|trade-off|implementation|synchronized|impact' },
                ],
                vocabulary: [
                    { word: 'efficiency', definition: 'The state of achieving maximum productivity with minimum wasted effort', example: 'Refactoring increased the code efficiency.' },
                    { word: 'trade-off', definition: 'A balance achieved between two desirable but incompatible features', example: 'Using this library was a trade-off between speed and size.' },
                ],
                quiz: [
                    { id: 'q1', type: 'mcq', question: 'What should you focus on first when explaining a project?', options: ['The line count', 'The problem solved', 'The font used', 'The variable names'], answer: 'The problem solved' },
                    { id: 'q2', type: 'fill', question: 'The final benefit of a project is its ___.', answer: 'impact' },
                    { id: 'q3', type: 'mcq', question: 'What is a "trade-off"?', options: ['A type of variable', 'A choice between two competing features', 'A bug in the code', 'A version control command'], answer: 'A choice between two competing features' },
                    { id: 'q4', type: 'fill', question: 'Code ___ refers to the actual writing and deployment.', answer: 'implementation' },
                    { id: 'q5', type: 'mcq', question: 'If a project helps teams work at the same time, it is ___?', options: ['Slow', 'Synchronized', 'Static', 'Offline'], answer: 'Synchronized' },
                    { id: 'q6', type: 'fill', question: 'Doing more with less effort is called ___.', answer: 'efficiency' },
                    { id: 'q7', type: 'voice', question: 'Summarize your most proud project in 3 sentences.', answer: '' },
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
