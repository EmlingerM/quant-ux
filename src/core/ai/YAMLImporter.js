import yaml from 'js-yaml'
import Logger from '../Logger'
import QSS from '../qss/QSS'
import HTMLImporter from './HTMLImporter'

export default class YAMLImporter extends HTMLImporter {

    constructor (lastUUID = 10000) {
        super(lastUUID)
        this.formWidth = "@form-width"
        this.containerPadding = 16
        this.paddingX = 16
        this.paddingY = 16
    }

    yamlQuantUX(content, domNode, width, height, options = {}) {
        Logger.log(-1, 'YAMLImporter.yamlQuantUX() > enter', options)
        
        this.isRemoveContainers = options.isRemoveContainers
        this.isWireFrame = options.isWireFrame
        this.customStyle = options.customStyle
        this.domNode = domNode
        const nodes = yaml.load(content)

        const root = {
            name: 'Screen',
            type: "Screen",
            id: 's' + this.getUUID(),
            min : {
                w : width,
                h : height
            },
            x: 0,
            y: 0,
            w: width,
            h: height,
            props: {
                start:true
            },
            has: {},
            style: {
                background: "#fff"
            },
            _type: "CONTAINER",
            children: []
        }
  
        //console.debug(JSON.stringify(nodes, null, 2))
        const tree = this.parseNode(nodes, root)
     
        this.layoutTree(tree, width - this.containerPadding * 2, this.containerPadding)


        const app = this.flattenTree(tree, width, height, options)
     
        const scalledApp = this.scalledApp(app)
        const layedOutApp = this.layoutApp(scalledApp)
        const cleanedApp = this.cleanUpModel(layedOutApp)

        //console.debug(JSON.stringify(cleanedApp, null, 2))
        return cleanedApp
    }

    layoutTree (node, width, offsetX = 0, offsetY = 0, gapX = 16, gapY = 16, indent= "") {
        let tempOffsetY = offsetY
        let tempOffsetX = offsetX
        let paddingX = 0
        let paddingY = 0
        if (!this.isRemoveContainers) {
            paddingX = this.paddingX
            paddingY = this.paddingX
            width -= (2 * gapX)
        }

        let totalHeigth = 0
        if (this.isRowContainer(node)) {
            const l = node.children.length 
            const childWidth = Math.floor((width - ((l-1) * gapX)) / l)            
            node.children.forEach((child) => {
                child.y = tempOffsetY
                child.x = tempOffsetX
                child.w = childWidth
                tempOffsetX = child.w + tempOffsetX + gapX
                const offsets = this.layoutTree(child, width, tempOffsetX, tempOffsetY + paddingY, gapX, gapY, indent + "   ")
                tempOffsetX = offsets.x             
                totalHeigth = Math.max(totalHeigth, child.h)
            })    
        } else {           
            node.children.forEach((child) => {
                child.x = tempOffsetX 
                child.w = width
                child.y = tempOffsetY

                if (this.isContainer(child)) {
                    tempOffsetY += paddingY
                } else {
                    child.h = this.computeContentHeight(child, width)
                }
                this.layoutTree(child, width, tempOffsetX + paddingX, tempOffsetY, gapX, gapY, indent + "   ")
                tempOffsetY += child.h + gapY
                totalHeigth += child.h + gapY              
            })    
        }

        if (node._type === "CONTAINER") {
            if (this.isRowContainer(node)) {
                totalHeigth += paddingY
            }        
            node.h = totalHeigth + paddingY
        }
        return {x: tempOffsetX, y: tempOffsetY} 
    }

    computeContentHeight (node, width) {
        let result = node.h
        if (node.type === 'Label') {
            let div =document.createElement('div')
            div.innerText = node.props.label
            div.style.width = width + 'px'
            div.style.fontFamily = node.style.fontFamily
            div.style.lineHeight = node.style.lineHeight

            div.style.fontSize = node.style.fontSize + 'px'
            this.domNode.appendChild(div)
            result = div.offsetHeight
            this.domNode.innerText = ""
        }
        return result
    }

    parseNode (node, parent = {children:[], type:"Screen"}) {
        if (Object.keys(node).length === 1) {
            for (let key in node) {
                const value = node[key]
                const widget = this.createWidget(key, value)
                if (parent) {
                    parent.children.push(widget)
                }
                if (value.CHILDREN) {
                    const children = value.CHILDREN
                    children.forEach(child => {
                        this.parseNode(child, widget)
                    })
                }
            }
        } else {
            Logger.error('YAMLImporter.parseNode() > wrong yaml node', node)
        }
        return parent
    }

    createWidget(type, node) {

        const widgetType = this.getWidgetType(type, node)
        const pos = this.getPosition(type, node)
        const height = this.getHeight(type, node)
        const has = this.getHas(widgetType)
        const props = this.getProps(type, node)

        let widget = {
            id: 'w' + this.getUUID(),
            name: this.getWidgetName(widgetType),
            type: widgetType,
            x: pos.x,
            y: pos.y,
            w: "@form-width",
            h: height,
            z: this.z,
            props: props,
            has:has,
            children: [],
            _type: type
        }

        if (type === "CONTAINER") {
            widget._flexDirection = node['FLEX-DIRECTION']
        }
       
        this.z++
        widget.style = this.getStyle(type, node)
        widget.active = this.getActiveStyle(type, node)
        widget.hover = this.getHoverStyle(type, node)
        widget.error = this.getErrorStyle(type, node)
        widget.focus = this.getFocusStyle(type, node)

        const qssTheme = QSS.getTheme("wireframe")
        QSS.replaceVariables(qssTheme, widget)
        QSS.replaceSize(qssTheme, widget)
        QSS.replaceBorderVariables(widget)
 
        return widget
    }

    getHeight(type) {
        if (type === "CONTAINER")  {
            return 0
        }
        if (type === "IMAGE")  {
            return "@box-height-l"
        }
        if (type === "TABLE")  {
            return "@box-height-l"
        }
        return  "@form-height"

    }


    isHiddenElement(widget) {
        if (this.isRemoveContainers && widget._type === "CONTAINER") {
            return true
        }
        return false
    }

    getActiveStyle (type) {
        if (type === 'INPUT') {
            return {
               "color": "@color-active",
               "background": "@background-active"
            }
        }

        return {}
    }

    getHoverStyle (type) {
        if (type === 'INPUT') {
            return {
                "borderColor": "@form-border-color:hover",
                "background": "@form-background:hover",
                "color": "@form-color:hover"
            }
        }
        if (type === 'BUTTON') {
            return {
                "borderColor": "@button-primary-border-color:hover",
                "background": "@button-primary-background:hover",
                "color": "@button-primary-color:hover"	
            }
        }
      
        return {}
    }


    getErrorStyle (type) {
        if (type === 'INPUT') {
            return {
                "borderColor": "@form-border-color:error",
                "background": "@form-background:error",
                "color": "@form-color:error",
                "colorButton": "@form-border-color:error"		
            }
        }

        return {}
    }

    getFocusStyle (type) {
        if (type === 'INPUT') {
            return {
                "borderWidth": "@border-width:focus",
                "borderColor": "@form-border-color:focus",
                "background": "@form-background:focus",
                "color": "@form-color:focus"
            }
        }

        return {}
    }

    getStyle (type, node) {
        const result = {
            fontFamily: "@font-family",
            fontSize: "@font-size-m",
            lineHeight: "@lineHeight",
            textAlign: "left",
            letterSpacing: "@letterSpacing",
            color: "@label-color",
            textShadow: null
        }

        if (type === 'BUTTON') {
            result.background = "@button-primary-background"
            result.borderColor = "@button-primary-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.padding = 0	
            result.color = "@button-primary-color"	
            result.textAlign = "center"
            result.verticalAlign = "middle"
        }

        if (type === 'TABLE') {
            result.background = "@form-background"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.color = "@form-color"
            result.borderRadius = "@border-radius"
            result.paddingBottom = "@form-padding-vertical",
			result.paddingTop = "@form-padding-vertical",
			result.paddingLeft = "@form-padding-horizontal",
			result.paddingRight = "@form-padding-horizontal"
            result.headerFontWeight = 800
            result.headerBackground = "@form-border-color"
            result.headerColor = "@form-background"
            result.headerSticky = true
            result.checkBox = false
            result.checkBoxHookColor = "#@background-active"
            result.checkBoxBackground = "@form-background"
            result.checkBoxBorderColor = "@form-border-color"
            result.checkBoxBorderRadius = "@border-radius"
            result.checkBoxBorderWidth = 1
        }
       
        if (type === 'CONTAINER') {
            result.colorButton = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
        }

        if (type === 'IMAGE') {
            result.colorButton = "@form-border-color"
            result.borderWidth = 0
            result.borderStyle = "solid"
            result.backgroundImage = null
        }

        if (type === 'INPUT') {
            result.background = "@form-background"
            result.borderColor = "@form-border-color"
            result.borderWidth = "@border-width"
            result.borderStyle = "solid"
            result.borderRadius = "@border-radius"
            result.color = "@form-color"
            result.paddingBottom = "@form-padding-vertical",
			result.paddingTop = "@form-padding-vertical",
			result.paddingLeft = "@form-padding-horizontal",
			result.paddingRight = "@form-padding-horizontal"
           
            if (node.TYPE === 'Checkbox') {
                result.colorButton = "@form-border-color"
                result.verticalAlign = "middle"
            }
            if (node.TYPE === 'RadioBox') {
                result.colorButton = "@form-border-color"
                result.verticalAlign = "middle"
            }          
        }

        if (node.TYPE === 'Headline') {
            result.fontSize = "@font-size-xl"
        }     

        if (!this.isWireFrame) {
            if (node.BACKGROUND) {
                result.background = node.BACKGROUND
            }
            if (node.COLOR) {
                result.color = node.COLOR
            }
            if (node.BORDER_COLOR) {
                result.borderColor = node.BORDER_COLOR
            }
        }

        return result
      
    }

    getPosition () {
        return {
            x: 0,
            y: 0,
            w: 0,
            h: 0
        }
    }

    getWidgetName (type) {
        return type + this.z
    }

    getProps (type, node) {
        const result = {}
        if (node.CONTENT) {
            result.label = node.CONTENT
        }            

        if (type === 'TABLE') {
            console.debug(node)
            if (node.COLUMNS) {
                result.columns = node.COLUMNS.map(c => {
                    return {      
                        "label": c,
                        "width": 100,
                        "isEditable": false,
                        "isSortable": false,
                        "isSearchable": false                        
                    }
                })
            }
            if (node.DATA) { 
                result.data = node.DATA
            }
        }

        if (type === 'INPUT') {
            result.placeholder = true
            if (node.PLACEHOLDER) {
                result.label = node.PLACEHOLDER
            }            
            if (node.TYPE === 'Checkbox') {
                result.checked = false              
            }              
            if (node.TYPE === 'RadioBox') {
                result.checked = false
            }
        }      
        return result
    }

    getHas(type) {
        if (type === 'Label') {
            return {
                "label": true,
                "padding": true,
                "advancedText": true
            }
        }

        if (type === 'Image') {
            return {
                "onclick" : true,
                "backgroundImage" : true,
                "borderRadius" : true
            }
        }
        
        return {
            "label" : true,
            "backgroundColor" : true,
            "border" : true,
            "editable" : true,
            "onclick" : true,
            "padding" : true
        }
    }

    getWidgetType (type, node) {
        if (type === 'CONTAINER') {
            return 'Box'
        }

        if (type === 'TABLE') {
            return 'Table'
        }

        if (type === 'LABEL') {
            return 'Label'
        }

        if (type === 'BUTTON') {
            return 'Button'
        }

        if (type === 'IMAGE') {
            return 'Image'
        }
               
        if (type === 'INPUT') {
            if (node.TYPE === 'Text') {
                return 'TextBox'
            }
            if (node.TYPE === 'Checkbox') {
                return 'LabeledCheckBox'
            }
            if (node.TYPE === 'Password') {     
                return 'Password'
            }
            if (node.TYPE === 'RadioBox') {
                return 'LabeledRadioBox'
            }
            if (node.TYPE === 'TextArea') {
                return 'TextArea'
            }           
            return 'TextBox'
        }
        return 'Button'

    }


    
    isRowContainer (node) {
        return node._flexDirection === "ROW"
    }

    isContainer (node) {
        return node._type === "CONTAINER"
    }
}
