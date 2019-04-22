import css from 'dojo/css'
import Logger from 'common/Logger'
import Core from 'core/Core'

export default class SimpleGrid extends Core{

	constructor () {
		super()
		this.logger = new Logger("Grid");
		this.logger.log(0,"constructor", "entry");	
		this.snappDistance = 10
		this.activePoint = "RightDown"
	}
	
	/**
	 * called when widget drag and drop starts
	 * 
	 * 
	 */
	start ( canvas, grid,zoom , activePoint){
		this.grid = grid;
		this.model = canvas.model;
		this.container = canvas.widgetContainer;
		
		this.activePoint = activePoint;
		if (grid.enabled) {
			this.gridHeight = (grid.h * zoom);
			this.gridWidth = (grid.w * zoom);
		} else{
			this.gridHeight = 1;
			this.gridWidth = 1;
		}
		
		this.zoom = zoom;
		this._lines = {};
		this._linesDivs = {};
		
		this.logger.log(0,"start", "exit > type :" +  this.selectedType +">  id :"+ this.selectedID + " > activePoint : " + activePoint);
	}
	
	correct (absPos, e, mouse){
		
		
		if(this.gridHeight > 0 && this.gridWidth > 0 ){
		
			/**
			 * FIXME: this will not work for inter screen drag and drop
			 * or adding a new screen! or adding! we should use here
			 * the 
			 */
			if(!absPos.w && absPos.h){
				absPos.w = 1;
				absPos.h = 1;
			}
		
			/**
			 * We use the getHooverScreen. This might be a little slower as we have to check all screens first.
			 * However we do not expect more than 50, so it should be ok...
			 * 
			 * FIXME: Check for lastScreen, if has changed search in all other screens
			 */
			var screen =this.getHoverScreen(absPos); 
	
			if(screen){
			
				var relPos = {
					x : absPos.x -screen.x,
					y : absPos.y -screen.y,
					w : absPos.w,
					h : absPos.h
				};
				
				
				this.correctMove(absPos, relPos);
	
			} else {
				/**
				 * Should ot happen
				 */
				console.debug("No hover screen",absPos, this.selectedModel);
			}
		
		}
		
		if (this.showDimensions){
			try{
				this.renderDimension(absPos, mouse)
			} catch( e){
				console.error(e);
				console.error(e.stack);
			}	
		}
		return absPos;
	}	
	
	renderDimension (pos, mouse) {
		if (!this.dimDiv) {
			var div = document.createElement("div");
			css.add(div, "MatcRulerDimensionLabel");		
			this.container.appendChild(div);
			this.dimDiv = div;
		}
		
		this.dimDiv.style.left = (mouse.x + 10) + "px";
		this.dimDiv.style.top = (mouse.y + 10)+ "px";	
		this.dimDiv.innerHTML = this._getHackedUnZoomed(pos.w, this.zoom)  + " x " +this._getHackedUnZoomed(pos.h, this.zoom);
		
	}
	
	/**
	 * We have to use ceil here, otherwise we have stupid effects...
	 */
	_getHackedUnZoomed (v, zoom){
		return Math.ceil(v / zoom);
	}
	
	correctMove (absPos, relPos){
		//console.debug("correctMove", absPos.x , thisgridHeight);	
		/**
		 * Dead simple. we only snap to top left corner! BAM. Solved
		 * 
		 * TODO: select the corner based on the
		 * movement direction!
		 */		
		var xDif  = Math.round(relPos.x % this.gridWidth);
		var yDif  = Math.round(relPos.y % this.gridHeight);
		
		if(xDif < this.snappDistance){
			absPos.x = absPos.x  -xDif;
		} else if(xDif > (this.gridWidth-this.snappDistance)){
			absPos.x = absPos.x + this.gridWidth-xDif;
		}
		
		if(yDif < this.snappDistance){
			absPos.y = absPos.y  -yDif;
		} else if(yDif > (this.gridHeight-this.snappDistance)){
			absPos.y = absPos.y + this.gridHeight-yDif;
		}	
	}
		
	getPoint (){		
	}
	
	cleanUp (){		
		for(var id in this._linesDivs){
			var div = this._linesDivs[id];
			this.container.removeChild(div);
		}
		if (this.dimDiv){
			this.container.removeChild(this.dimDiv);
		}
		delete this._linesDivs;
		delete this.dimDiv;
	}
}
   