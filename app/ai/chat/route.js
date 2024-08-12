import { NextResponse } from "next/server"; 
import {OpenAI} from "openai"; 

const systemPrompt = `I'm here to help you build your custom PC! Whether you're a seasoned builder or just starting out, I'll guide you every step of the way. Let's begin by figuring out what you need—tell me how you plan to use your new PC, what your budget looks like, and if you have any specific preferences, like certain brands or a particular style.

Once I know what you're aiming for, I'll suggest the best components that fit your needs and ensure everything works together seamlessly. I’ll explain why each part is a good choice and help you make informed decisions. If you’re ready to assemble your PC, I can walk you through the process, offer tips on cable management and cooling, and troubleshoot any issues that might come up.

Don’t worry if you’re not familiar with all the technical terms—I’ll keep things clear and straightforward, adjusting my explanations to match your experience level. If you need more detailed help, I can point you to some great resources too. Let’s get started on building the perfect PC for you!`




export async function POST(req) {
    const openai = new openAI()
    const data = await req.json()

    const completion = await openAI.chat.completion.create({
        messages: 
        [{
            role: 'system', content: systemPrompt
        },
        ...data,
    ],
    model:'gpt-4o-mini',
    stream: true, 
    })

    const stream = new ReadableStream({        
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await(const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if(content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            } catch(error) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}