Studio.Font = function(family,size,weight,style,varient){
	this.size = size || 16
	this.family = family || 'Arial'
	this.weight = weight || ''
	this.style = style || ''
	this.varient = varient || ''
	this.lineHeight = 20
	this.fontColor = '#eee'
	this.shadow = 0
}

Studio.Font.prototype = {
	constructor : Studio.Font,
	build: function(){
		return (this.varient +' '+ this.style +' '+ this.weight +' '+ this.size +'px '+ this.family)
	},
	set: Studio.apply,
	modify: function(attr){
		if(!attr){
			return this.build()
		}
		var varient = attr.varient || this.varient
		var style = attr.style || this.style
		var weight = attr.weight || this.weight
		var size = attr.size || this.size
		var family = attr.family || this.family
		return (varient +' '+ style +' '+ weight +' '+ size +'px '+ family)
	}
}




Studio.TextBox = function(width, height, stage) {
	this.height = height
	this.width = width

	this.font = new Studio.Font()
	this._lastfont = this.font.build()
	this.shadow = 1
	this.offsetY = 0
	this._offsetY = this.offsetY;
	this.shadowColor = 'rgba(0,0,0,0.5)'
	this.image = new Studio.Cache(width,height, stage.resolution)
	this.image.ctx.textBaseline = 'top'
	this.text = ''
	this._wrap_height = this.lineHeight
	this.horizontal_align = Studio.LEFT
	this.justify = false
	this.vertical_align = Studio.TOP
	this._vertical_align = 0
	this.columns = 1
	this.gutter = 20
	this.live = false

	this.styles = {
		'b': {
			weight: 'bold',
			color: 'red'
		},
		'i':{
			style: 'italic',
			color: 'green'
		},
		'h1': {
			height: 'bold',
			size: 32,
			lineHeight: 40,
		},
		'h2': {
			height: 'bold',
			size: 24,
			lineHeight: 30,
		},
	}
	// document.body.appendChild(this.image.bitmap)
	return this
}

Studio.inherit(Studio.TextBox, Studio.Sprite)

Studio.TextBox.prototype.setFont = function(font) {
	this.font = font
	return this
}

Studio.TextBox.prototype.setText = function(text) {
	this.text = text
	return this
}

Studio.TextBox.prototype.setColor = function(color) {
	this.fontColor = color
	return this
}

Studio.TextBox.prototype.setFont = function(font) {
	this.image.ctx.font = this.font = font
	return this
}

Studio.TextBox.prototype.finish = function() {
	this.reset()
	this.wrapText()
	this.image.dirty = true
}

Studio.TextBox.prototype.reset = function() {
	this.image.ctx.clearRect(0, 0, this.width, this.height)
	this.image.ctx.font = this.font
}

Studio.TextBox.prototype.writeLine = function(styles, x, y, vx) {
	var style = styles.split(' ')
	var nx = 0 
	var vx = vx || 0
	this.image.ctx.font = this._lastfont
	for(var i = 0; i!= style.length ; i++){
		var word = style[i]
		if(word[0]==='<' && word[word.length-1]==='>'){
			if(word=='</>'){
				this._lastfont = this.font.build()
				this.image.ctx.font = this._lastfont
				this.image.ctx.fillStyle = this.font.fontColor;
				this._offsetY = this.offsetY
			}else{
				var tag = this.styles[word.slice(1,word.length-1)];
				if(tag){
					this._lastfont = this.font.modify(tag)
					this.image.ctx.font = this._lastfont
					this.image.ctx.fillStyle = tag.color
					if(tag.offsetY){
						this._offsetY = tag.offsetY
					}
				}
			}
			
		}else{
			if(this.shadow){
				var front_color = this.image.ctx.fillStyle;
				this.image.ctx.fillStyle = this.shadowColor
			 	for(var s = 1; s<= this.shadow; s+=.5){
			 		this.image.ctx.globalAlpha = this.shadow/s
			 		this.image.ctx.fillText(word, nx + x + 1 + s + (vx* i), y + s + this._offsetY)
			 	}
			 	this.image.ctx.fillStyle=front_color
			}
			this.image.ctx.fillText(word, nx + x + (vx* i), y + this._offsetY)
			nx += this.image.ctx.measureText(word+' ').width
		}
	}

	// if (this.shadow) {
	// 	this.image.ctx.fillStyle = this.shadowColor
	// 	for(var i = 1; i<= this.shadow; i+=.5){
	// 		this.image.ctx.globalAlpha = this.shadow/i
	// 		this.image.ctx.fillText(text, x + 1 + i, y + i)
	// 	}
	// }
	// this.image.ctx.fillStyle = this.fontColor
	// this.image.ctx.fillText(text, x + 1, y)
}

Studio.TextBox.prototype.wrapText = function() {
	this.image.ctx.fillStyle = this.font.fontColor;
	this._lastfont = this.font.build();
	this.image.ctx.font = this._lastfont
	var width = (this.width-(this.gutter*(this.columns-1)))/this.columns
	var start = 1
	var paragraphs = this.text.split('\n')
	var y = 0
	for (var i = 0; i !== paragraphs.length; i++) {
		var words = paragraphs[i].split(' ')
		var line = ''
		var styleline = ''
		var testWidth = 0
		var metrics = 0
		var lineHeight = this.font.lineHeight
		var just = 0
		for (var n = 0; n < words.length; n++) {
			var word = words[n];
			if(word[0]==='<' && word[word.length-1]==='>'){
				if(word=='</>'){
					this.image.ctx.font = this.font.build()
				}else{
					var tag = this.styles[word.slice(1,word.length-1)];
					if(tag){
						this.image.ctx.font = this.font.modify(tag)
						if(tag.lineHeight){
							lineHeight = tag.lineHeight
						}
					}
				}
				
				metrics = 0
			}else{
				metrics = this.image.ctx.measureText(word +' ').width
			}

			testWidth += metrics
			if (testWidth > width && n > 0) {
				testWidth -= metrics
				// testWidth = this.image.ctx.measureText(line).width
				// We want to avoid any off pixel font rendering so we use | 0 to prevent floats
				// also offset everything by 1px because it helps with the centering of text
				if(y+lineHeight>=this.height){
					y = 0
					start += width+this.gutter
				}
				if(this.justify==true){
					this.writeLine( styleline, start, y , (width - testWidth)/(just))
				}else{
					this.writeLine( styleline, start + ((width - testWidth) * this.horizontal_align) | 0 , y, 0)
				}
				just = 0
				styleline = word +' '
				y += lineHeight
				testWidth = metrics
			} else {
				styleline = styleline + word + ' '
				just++
			}
		}
		if(y+lineHeight>=this.height){
			y = 0
			start += width+this.gutter
		}

		this.writeLine( styleline, start + ((width - testWidth) * this.horizontal_align) | 0, y , .25)
		
		
		this._wrap_height = y + lineHeight
		if (i !== paragraphs.length - 1) {
			y += lineHeight
		}
	}
	// this._wrap_height += (this.shadow * 2) + 1;
	if (this._wrap_height > this.height) {
		this._wrap_height = this.height
	}
	this._vertical_align = (this._wrap_height * this.vertical_align - this.height * this.vertical_align) | 0
}

Studio.TextBox.prototype.fit = function() {
	this.image.height = this._wrap_height
	this.wrapText()
}

Studio.TextBox.prototype.debugDraw = function(ctx) {
	ctx.strokeRect(this._dx - (this._world.width * this.anchorX), this._dy - (this._world.height * this.anchorY) - this._vertical_align, this._world.width, this._wrap_height)
}

Studio.TextBox.prototype.drawAngled = function(ctx) {
	ctx.save()
	this.prepAngled(ctx)
	ctx.drawImage(this.image.bitmap, 0, 0, this.image.bitmap.width, this.image.bitmap.height, -(this.width * this.anchorX), -(this.height * this.anchorY) - this._vertical_align, this.width, this.height)
	ctx.restore()
}

Studio.TextBox.prototype.update_xy= function() {
	if (this.orbits && this._parent.angle) {
		this.update_orbit_xy()
	} else {
		this._world.x  = ((this.x * this._parent.scaleX) + this._parent.x)
		this._world.y  = ((this.y * this._parent.scaleY) + this._parent.y) - this._vertical_align 
	}
	if(this.live){
		this.finish()
	}
}

Studio.TextBox.prototype.draw = function(ctx) {
	this.setAlpha(ctx)
	// since we don't resize the ctx, we need to compensate based on the differences of the ctx height and text height
	if (this.angle) {
		this.drawAngled(ctx)
	} else {
		ctx.drawImage(this.image.bitmap, 0, 0, this.image.bitmap.width, this.image.bitmap.height, this._dx - (this._dwidth * this.anchorX), this._dy - (this._dheight * this.anchorY), this._dwidth, this._dheight)
	}
}

Studio.TextBox.prototype.verts = function(box, buffer){
	this.addVert(buffer,box.TL,0,0)
	this.addVert(buffer,box.TR,1,0)
	this.addVert(buffer,box.BL,0,1)
	this.addVert(buffer,box.BR,1,1)
}

