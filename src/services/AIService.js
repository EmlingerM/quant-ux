import Logger from 'common/Logger'
import AbstractService from './AbstractService'
import * as StyleImporter from 'core/ai/StyleImporter'

export default class AIService extends AbstractService {


    constructor() {
        super()
        this.logger = new Logger('AIService')
        this.messages = []
        this.language = 'YAML'
    }

    reset () {
        this.messages = []
    }

    async runCodex (message, key) {
        return this.runCompletions(message, key, 'code-davinci-002')
    }

    async runDavinci (message, key) {
        return this.runCompletions(message, key, 'text-davinci-003')
    }


    async runCompletions (message, key, model, temperature = 0, maxTokens = 2000) {

        const prompt =`
            You are HTMLGPT, a masterful webdeveloper. Please create a HTML page for the following
            description:

            ${message}

            Please output a a HTML page.`


        const data = {
            'openAIModel': '/v1/completions',
            'openAIToken': key,
            'openAIOrgID': 'Klaus',
            'openAIPayload': {
                "model": model,
                "prompt": prompt,
                "max_tokens": maxTokens,
                "temperature": temperature
            }
        }

        try {
            const res = await this._post('/ai/openai.json', data)
            console.debug(res)
            if (res.choices && res.choices.length > 0) {
                const choice = res.choices[0]
                const content = choice?.text
                return this.extractHTML(content)
            }
        } catch (err){
            return {
                error: 'design-gpt.error-server'
            }
        }
        return {
            error: 'design-gpt.error-no-idea'
        }
    }

    runFakeYaml (ms = 200) {
        return new Promise(resolve => {
            setTimeout(() => {
            resolve({
                yaml:`
                CONTAINER:
                    FLEX-DIRECTION: COLUMN
                    CHILDREN:
                        - IMAGE:
                            CONTENT: "Join the Party!"
                        - LABEL:
                            TYPE: Paragraph
                            COLOR: 'red'
                            BACKGROUND: 'blue'
                            CONTENT: "Come on in! The more the merrier. But first, we need some details"
                        - INPUT:
                            TYPE: Text
                            PLACEHOLDER: "Username"
                        - INPUT:
                            TYPE: Password
                            PLACEHOLDER: "Password"
                        - INPUT:
                            TYPE: Text
                            PLACEHOLDER: "Email"
                        - INPUT:
                            TYPE: Checkbox
                            PLACEHOLDER: "I agree to terms and conditions"
                        - CONTAINER:
                            FLEX-DIRECTION: ROW
                            CHILDREN:
                            - BUTTON:
                                CONTENT: "Sign Up"
                            - BUTTON:
                                CONTENT: "Login"
                        - INPUT:
                            TYPE: Checkbox
                            PLACEHOLDER: "I agree to terms and conditions"
            ` })
        }, ms)
        })
    }

    runFakeYaml2 (ms = 200) {

        return new Promise(resolve => {
            setTimeout(() => {
            resolve({
                yaml:`
                CONTAINER:
                    FLEX-DIRECTION: COLUMN
                    CHILDREN:
                        - TABLE:
                            COLUMNS: ["ID", "Username", "Email", "Role"]
                            DATA:
                            - ["1", "johndoe", "john@example.com", "Member"]
                            - ["2", "janedoe", "jane@example.com", "Admin"]
                            - ["3", "stevesmith", "steve@example.com", "Member"]
                            - ["4", "maryjohnson", "mary@example.com", "Moderator"]
                            COLOR: "#000000"
                            BACKGROUND: "#FAFAFA"
                            BORDER_COLOR: "#E0E0E0"
                        - CONTAINER:
                            FLEX-DIRECTION: COLUMN
                            CHILDREN:
                            - LABEL:
                                TYPE: Headline
                                CONTENT: "Welcome to Our Startup"
                                COLOR: 'red'
                                BACKGROUND: 'blue'
                                BORDER_COLOR: 'yellow'
                            - BUTTON:
                                CONTENT: "MORE."
                                BORDER_COLOR: 'yellow'

                        - CONTAINER:
                            FLEX-DIRECTION: ROW
                            CHILDREN:
                            - BUTTON:
                                CONTENT: "Learn More"
                            - BUTTON:
                                CONTENT: "Contact Us"

                        - CONTAINER:
                            FLEX-DIRECTION: COLUMN
                            CHILDREN:
                            - LABEL:
                                TYPE: Headline
                                CONTENT: "Sign Up Now"
                            - LABEL:
                                TYPE: Label
                                CONTENT: "Full Name"
                            - INPUT:
                                TYPE: Text
                                PLACEHOLDER: "Enter your name"

                            - LABEL:
                                TYPE: Label
                                CONTENT: "Email"
                            - INPUT:
                                TYPE: Text
                                PLACEHOLDER: "Enter your email"

                            - LABEL:
                                TYPE: Label
                                CONTENT: "Password"
                            - INPUT:
                                TYPE: Password
                                PLACEHOLDER: "Enter a secure password"

                            - LABEL:
                                TYPE: Label
                                CONTENT: "Confirm Password"
                            - INPUT:
                                TYPE: Password
                                PLACEHOLDER: "Re-enter your password"
                            
                            - BUTTON:
                                CONTENT: "Register Now"
        ` })
            }, ms)
        })
    }

    runFakeYaml3 (ms = 200) {
        return new Promise(resolve => {
            setTimeout(() => {
            resolve({
                yaml:`
                    CONTAINER:
                        FLEX-DIRECTION: COLUMN
                        CHILDREN:
                            - CONTAINER:
                                FLEX-DIRECTION: ROW
                                BACKGROUND: "#FFFFFF"
                                CHILDREN:
                                    - LABEL:
                                        TYPE: "Headline"
                                        CONTENT: "Join the Fun!"
                                        COLOR: "#333333"
                            - CONTAINER:
                                FLEX-DIRECTION: ROW
                                CHILDREN:
                                    - LABEL:
                                        TYPE: "Paragraph"
                                        CONTENT: "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them!"
                                        COLOR: "#555555"
                            - CONTAINER:
                                FLEX-DIRECTION: COLUMN
                                CHILDREN:
                                - INPUT:
                                    PLACEHOLDER: "Username"
                                    TYPE: "Text"
                                    BORDER_COLOR: "#CCCCCC"
                                - INPUT:
                                    PLACEHOLDER: "Email"
                                    TYPE: "Text"
                                    BORDER_COLOR: "#CCCCCC"
                                - INPUT:
                                    PLACEHOLDER: "Password"
                                    TYPE: "Password"
                                    BORDER_COLOR: "#CCCCCC"
                                - INPUT:
                                    PLACEHOLDER: "Confirm Password"
                                    TYPE: "Password"
                                    BORDER_COLOR: "#CCCCCC"
                            - CONTAINER:
                                FLEX-DIRECTION: ROW
                                CHILDREN:
                                - BUTTON:
                                    CONTENT: "Sign Up"
                                    BACKGROUND: "#FFD700"
                                    COLOR: "#FFFFFF"
                                    BORDER_COLOR: "#FFD700"
                                - BUTTON:
                                    CONTENT: "Login"
                                    BACKGROUND: "#FFD700"
                                    COLOR: "#FFFFFF"
                                    BORDER_COLOR: "#FFD700"
            ` })
        }, ms)
        })
    }
    
    runFake(ms = 200) {
        return new Promise (resolve => {
            setTimeout(() => {
                resolve( {
                    html:`
                <html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Login Page</title>
                        <style>
                            *{
                                box-sizing: border-box;
                                font-family: Arial, sans-serif;
                            }
                            body{
                                background-color: #f1f1f1;
                                margin: 0;
                                padding: 0;
                                margin: 24px
                            }
                            .container{
                                width: 90%;
                                max-width: 720px;
                                margin: 0 auto;
                                padding: 20px;
                                background-color: #fff;
                                border-radius: 10px;
                                box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.2);
                            }
                            form{
                                display: flex;
                                flex-direction: column;
                            }
                            label{
                                margin-bottom: 5px;
                                font-weight: bold;
                            }
                            input{
                                height: 40px;
                                padding: 5px;
                                margin-bottom: 10px;
                                border: none;
                                border-radius: 5px;
                                font-size: 18px;
                                outline: none;
                            }
                            button{
                                height: 40px;
                                background-color: red;
                                color: #fff;
                                border: none;
                                border-radius: 5px;
                                font-size: 18px;
                                cursor: pointer;
                            }
                            .forgot-password{
                                margin-top: 10px;
                                text-align: center;
                            }
                            .forgot-password a{
                                color: red;
                                font-weight: bold;
                                text-decoration: none;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Login Page</h1>
                            <form>
                                <label for="username">Username</label>
                                <input type="text" id="username" name="username" required>
    
                                <label for="password">Password</label>
                                <input type="password" id="password" name="password" required>
    
                                <button type="submit">Login</button>
                            </form>
                            <div class="forgot-password">
                                <a href="#">Forgot Password?</a>
                            </div>
                        </div>
                    </body>
                    </html>`})
            }, ms)
        })
    }

    async runGPT4Turbo (message, key, app, options) {
        return this.runChatHTML('gpt-4-1106-preview', message, key, app, options)       
    }

    async runGPT4 (message, key, app, options) {
        return this.runChatHTML('gpt-4', message, key, app, options)       
    }

    async runGPT35Turbo(message, key, app, options) {
        return this.runChatHTML('gpt-3.5-turbo', message, key, app, options)
    }

    async runGPT4TurboYaml(message, key, app) {

        const prompt =`
            This is a UI language in YAML which has the following elements:

            CONTAINER: An element that can have child elements. I container has an list of CHILDREN elements. 
                A container has an attribute FLEX-DIRECTION. It can have the values ROW and COLUMN. ROW means,
                that the elements are aligned horizontal from left to right, COLUMN means the elements are aligned vertical from top to down.
            
            LABEL: An Element that can show text. It has a CONTENT element. A label has a TYPE element which can be "Headline", "Label" or "Paragraph"

            BUTTON: An Element that can show text. It has a CONTENT element. 
            
            INPUT: An element to render a text field. It can have a PLACEHOLDER ELEMENT and a TYPE element. The TYPE can be "Text", "Checkbox", "RadioBox", "Switch", "Password" or "TextArea".
            
            IMAGE: An element to present an image. It has a CONTENT child element. Images are optional and should only be included if needed.

            TABLE: An element to present a table. It has a COLUMNS element which is a list of column names. 
            It also has a DATA element which is an ARRAY of ARRAY of string values.

            Each element can have a COLOR, BACKGROUND and BORDER_COLOR element to describe the visual appearance. The values are hex color codes.

            Please generate :

            ${message}

            
            Return the result as YAML in the defined language. Do not include any additional text.
        `

        const data = {
            'openAIModel': '/v1/chat/completions',
            'openAIToken': key,
            'openAIOrgID': 'Klaus',
            'openAIPayload': {
                "model": 'gpt-4-1106-preview',
                "messages": [
                    {"role": "system", "content": `
                        You are design GPT. You are really good at deisgn web sites and mobile apps.
                    `},
                    {"role": "system", "content": `
                        The website you generate should run on a ${app.type} device.
                        The screen with is ${app.screenSize.w} pixel
                    `},
                    //{"role": "system", "content": this.getStylePrompt(app, options)},
                    {"role": "user", "content": prompt}
                ]
            }
        }

        return this.runPrompt(data, 'yaml')
    }


    async runChatHTML (model, message, key, app) {
        const prompt =`
            Please create a HTML page for the following
            description:

            ${message}

            
            Please output as a HTML page.
        `

        const data = {
            'openAIModel': '/v1/chat/completions',
            'openAIToken': key,
            'openAIOrgID': 'Klaus',
            'openAIPayload': {
                "model": model,
                "messages": [
                    {"role": "system", "content": `
                        You are HTMLGPT, a masterful webdeveloper skillful in HTML and CSS. 
                        You have a great experiences designing beautiful websites that delight their users.
                        Make sure that some CSS is included and the page is well styled.
                    `},
                    {"role": "system", "content": `
                        The website you generate should run on a ${app.type} device.
                        The screen with is ${app.screenSize.w} pixel
                    `},
                    //{"role": "system", "content": this.getStylePrompt(app, options)},
                    {"role": "user", "content": prompt}
                ]
            }
        }

        return this.runPrompt(data)
    }

    async runPrompt (data, returnType = 'html') {

        try {
            const start = Date.now()
            const res = await this._post('/ai/openai.json', data)
            const end = Date.now()
            this.logger.error('runPrompt() > API took ', end-start)

            if (res.choices && res.choices.length > 0) {
                const choice = res.choices[0]
                const content = choice?.message?.content
                if (returnType === 'html') {
                    return this.extractHTML(content)
                } else {
                    return this.extractYAML(content)
                }

            }
            if (res.error) { 
                this.logger.error('runPrompt() > Error from API', res)
                if (res.error.code === 'invalid_api_key') {
                    return {
                        error: 'design-gpt.error-server-key'
                    }
                }
                if (res.error.code === 'insufficient_quota') {
                    return {
                        error: 'design-gpt.error-insufficient_quota'
                    }
                }
            }
        } catch (err){
            return {
                error: 'design-gpt.error-server'
            }
        }
        return {
            error: 'design-gpt.error-no-idea'
        }
    }

    getStylePrompt (app, options) {
        if (!options.isCustomStyles) {
            return ''
        }
        try {

            const customStyles = StyleImporter.getCustomStyle(app)
            return `
                Unless further specified, use the following colors and backgrounds for the HTML elements:
                Screens should have one of the following background colors: ${this.join(customStyles?.screen?.background)}.
                Buttons should have one of the following background colors: ${this.join(customStyles?.button?.background)}.
                Buttons should have one of the following colors: ${this.join(customStyles?.button?.color)}.
                Labels, P and normal text should have one of the following colors: ${this.join(customStyles?.label?.color)}.
                INPUT elements should have one of the following background colors: ${this.join(customStyles?.input?.background)}.
                INPUT elements should have one of the following colors: ${this.join(customStyles?.input?.color)}.
                INPUT elements should have one of the following border color : ${this.join(customStyles?.input?.borderTopColor)}.
            `
        } catch (err) {
            this.logger.error('getStylePrompt', 'Error', err)
        }

        return ''
    }

    join(arr) {
        if (arr) {
            return arr.join(', ')
        }
        return ''
    }

    extractYAML (content) {
        console.debug('extractYAML', content)
        try {
            content = content.split('\n').slice(1, -1).join('\n')
            return {
                yaml: content
            }
        } catch (e) {
            console.error(e)
        }
        return {
            error: 'design-gpt.error-no-yaml'
        }
    }

    extractHTML (content) {
          
        if (!content) {
            return {
                error: 'error-no-content'
            }
        }
        const start = content.indexOf('html>')
        const end = content.indexOf('</html>')
        if (start > -1 && end > -1) {
            let innerHTML = content.substring(start + 5, end)
            innerHTML = innerHTML.replace('<html>', '')
            return {
                html: `<html>${innerHTML}</html>`
            }
        } 
        return {
            error: 'design-gpt.error-no-html'
        }
    }

    getAssistants () {
        return this._get('/v1/assistants')
    }

}