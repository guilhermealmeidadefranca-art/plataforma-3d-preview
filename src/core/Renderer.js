import { boxTransform, lookAt, multiply, perspective } from './Mat4.js';

const VERTEX_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  uniform mat4 uViewProjection;
  uniform mat4 uModel;
  uniform float uYaw;
  varying vec3 vNormal;
  void main() {
    vec4 worldPosition = uModel * vec4(aPosition, 1.0);
    float cosine = cos(uYaw);
    float sine = sin(uYaw);
    vNormal = vec3(cosine * aNormal.x - sine * aNormal.z, aNormal.y, sine * aNormal.x + cosine * aNormal.z);
    gl_Position = uViewProjection * worldPosition;
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(vec3(-0.45, 0.85, 0.35));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float hemisphere = 0.38 + 0.22 * max(normal.y, 0.0);
    float light = hemisphere + diffuse * 0.58;
    gl_FragColor = vec4(uColor * light, 1.0);
  }
`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Falha ao compilar shader: ${message}`);
  }
  return shader;
}

function createCube(gl) {
  const faces = [
    { n: [0, 0, 1], p: [[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]] },
    { n: [0, 0, -1], p: [[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]] },
    { n: [1, 0, 0], p: [[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]] },
    { n: [-1, 0, 0], p: [[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]] },
    { n: [0, 1, 0], p: [[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]] },
    { n: [0, -1, 0], p: [[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]] },
  ];
  const vertices = [];
  const order = [0, 1, 2, 0, 2, 3];
  for (const face of faces) {
    for (const index of order) vertices.push(...face.p[index], ...face.n);
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  return { buffer, count: vertices.length / 6 };
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!this.gl) throw new Error('Este navegador não disponibilizou WebGL.');
    const gl = this.gl;
    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Falha ao vincular shaders: ${gl.getProgramInfoLog(program)}`);
    }
    this.program = program;
    this.cube = createCube(gl);
    this.locations = {
      position: gl.getAttribLocation(program, 'aPosition'),
      normal: gl.getAttribLocation(program, 'aNormal'),
      viewProjection: gl.getUniformLocation(program, 'uViewProjection'),
      model: gl.getUniformLocation(program, 'uModel'),
      color: gl.getUniformLocation(program, 'uColor'),
      yaw: gl.getUniformLocation(program, 'uYaw'),
    };
    this.projection = new Float32Array(16);
    this.view = new Float32Array(16);
    this.viewProjection = new Float32Array(16);
    this.model = new Float32Array(16);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
  }

  resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.floor(this.canvas.clientWidth * ratio));
    const height = Math.max(1, Math.floor(this.canvas.clientHeight * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.gl.viewport(0, 0, width, height);
    perspective(this.projection, Math.PI / 3, width / height, 0.1, 120);
  }

  begin(cameraPosition, target, skyColor = [0.42, 0.72, 0.86]) {
    const gl = this.gl;
    this.resize();
    lookAt(this.view, cameraPosition, target);
    multiply(this.viewProjection, this.projection, this.view);
    gl.clearColor(skyColor[0], skyColor[1], skyColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cube.buffer);
    gl.enableVertexAttribArray(this.locations.position);
    gl.enableVertexAttribArray(this.locations.normal);
    gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(this.locations.normal, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(this.locations.viewProjection, false, this.viewProjection);
  }

  drawBox(position, size, color, yaw = 0) {
    const gl = this.gl;
    boxTransform(this.model, position, size, yaw);
    gl.uniformMatrix4fv(this.locations.model, false, this.model);
    gl.uniform3fv(this.locations.color, color);
    gl.uniform1f(this.locations.yaw, yaw);
    gl.drawArrays(gl.TRIANGLES, 0, this.cube.count);
  }
}
