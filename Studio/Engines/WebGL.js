var FRAGMENTSHADER = ['precision lowp float;',
						'uniform sampler2D u_image;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'   if(v_texture.x==10.0){',
						'		gl_FragColor = v_color;',
						'	}else{',
						'		gl_FragColor = texture2D(u_image, v_texture) * v_color;',
						'	}',
						'}'].join('\n')

var VERTEXSHADER = ['attribute vec3 a_position;',
						'attribute vec4 a_color;',
						'attribute vec2 a_texture;',
						'uniform vec2 u_resolution;',
						'uniform mat3 u_matrix;',
						'varying vec4 v_color;',
						'varying vec2 v_texture;',
						'void main(void) {',
						'   vec2 canvas_coords = (u_matrix * vec3(a_position.xy,1)).xy;',
						'   vec2 clipSpace = ((canvas_coords / u_resolution)*2.0) - 1.0;',
						'	gl_Position = vec4(clipSpace * vec2(1, -1), a_position.z, 1);',
						'	v_color = a_color;',
						'	v_texture = a_texture;',
						'}'].join('\n')

Studio.Stage.prototype.loadShader = function(who, shader) {
	this.ctx.shaderSource(who, shader)
}

Studio.Stage.prototype.WEBGL = {

	type: 'webgl',

	antialias: false,
	premultipliedAlpha: false,
	stencil: true,

	getContext: function() {
		if (Studio.browser_info.iOS) {
			this.WEBGL.antialias = true
		} else {
			this.WEBGL.antialias = false
		}
		this.ctx = this.bitmap.getContext(Studio.browser_info.webGL, {
			antialias: this.WEBGL.antialias ,
			premultipliedAlpha: this.WEBGL.premultipliedAlpha ,
			stencil: this.WEBGL.stencil
		})
	},
	newBatch: function(gl, name) {
		gl._rects = new Float32Array(16384 * 32)
	},
	init: function(gl) {
		this._max_textures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
		this._count = 0
		this.rect_buffer = new Studio.BufferGL(null,0,gl)
		gl.clearColor(0,0,0,1)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		this.vertexShader = gl.createShader(gl.VERTEX_SHADER)
		this.loadShader(this.vertexShader , VERTEXSHADER)

		this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
		this.loadShader(this.fragmentShader , FRAGMENTSHADER)

		gl.enable(gl.DEPTH_TEST)
		gl.depthFunc(gl.LESS)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		gl.enable(gl.BLEND)
		// gl.disable(gl.DEPTH_TEST);

		this.program = gl.createProgram()
		gl.attachShader(this.program, this.vertexShader)
		gl.attachShader(this.program, this.fragmentShader)

		gl.compileShader(this.vertexShader)
		gl.compileShader(this.fragmentShader)

		gl.linkProgram(this.program)

		gl.useProgram(this.program)
	},

	prep: function(gl) {
		this.buffers = {}

		gl.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution')
		gl.matrixLocation = gl.getUniformLocation(this.program, 'u_matrix')
		// gl.scaleLocation = gl.getUniformLocation(this.program, 'u_scale')
		gl.enableVertexAttribArray(0)

		gl.positionLocation = gl.getAttribLocation(this.program, 'a_position')

		gl.bindAttribLocation(this.program, 0, 'a_position')



		gl.colorLocation = gl.getAttribLocation(this.program, 'a_color')

		gl.textureLocation = gl.getAttribLocation(this.program, 'a_texture')

		gl.uniform2f(gl.resolutionLocation, this.width, this.height)

		this.buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)

		gl.enableVertexAttribArray(gl.positionLocation)
		gl.enableVertexAttribArray(gl.colorLocation)
		gl.enableVertexAttribArray(gl.textureLocation)

		gl.vertexAttribPointer(gl.positionLocation, 3, gl.FLOAT, false, 36, 0)
		gl.vertexAttribPointer(gl.colorLocation, 4, gl.FLOAT, false, 36, (3) * 4)
		gl.vertexAttribPointer(gl.textureLocation, 2, gl.FLOAT, false, 36, (3 + 4) * 4)

		this._rect_index_buffer = gl.createBuffer()
		this._rect_index = new Uint16Array(this._maxCount * 7)

		for (var i = 0, j = 0; i < this._maxCount * 7; i += 6, j += 4) {
			this._rect_index[i + 0] = j + 0
			this._rect_index[i + 1] = j + 1
			this._rect_index[i + 2] = j + 2
			this._rect_index[i + 3] = j + 1
			this._rect_index[i + 4] = j + 2
			this._rect_index[i + 5] = j + 3
		}
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._rect_index_buffer)
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._rect_index, gl.STATIC_DRAW)
	},
	render:  function(lag) {
		this._count = 0
		this.draws = 0
		this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT)
		if (this.previousScene) {
			this.previousScene.buildElement(this, lag, this.interpolate)
			this.previousScene.vertex_children(this, lag, this.interpolate)
		}
		if (this.activeScene) {
			this.activeScene.buildElement(this, lag, this.interpolate)
			this.activeScene.vertex_children(this, lag, this.interpolate)
		}
		this.vertex_children(this, lag, this.interpolate)
		this.camera.render(this, lag, 1);
		this.rect_buffer.draw(this.ctx)
		for (var i in this.buffers) {
			this.buffers[i].draw(this.ctx)
		}

	}
}
