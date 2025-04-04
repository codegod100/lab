/** @jsxImportSource preact */
import { FunctionalComponent } from 'preact';
import { useRef, useEffect } from 'preact/hooks';
import * as THREE from 'three';

const ThreeCanvas: FunctionalComponent = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: {
        value: new THREE.Vector3(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight,
          1
        ),
      },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      fragmentShader: `
        uniform float iTime;
        uniform vec3 iResolution;

        #define MAX_STEPS 150
        #define MAX_DIST 100.0
        #define SURF_DIST 0.001

        float mandelbulb(vec3 p) {
          vec3 z = p;
          float dr = 1.0;
          float r = 0.0;
          const float Power = 8.0;
          for (int i = 0; i < 8; i++) {
            r = length(z);
            if (r > 2.0) break;

            float theta = acos(z.z / r);
            float phi = atan(z.y, z.x);
            dr = pow(r, Power - 1.0) * Power * dr + 1.0;

            float zr = pow(r, Power);
            theta = theta * Power;
            phi = phi * Power;

            z = zr * vec3(
              sin(theta) * cos(phi),
              sin(theta) * sin(phi),
              cos(theta)
            ) + p;
          }
          return 0.5 * log(r) * r / dr;
        }

        float rayMarch(vec3 ro, vec3 rd) {
          float dO = 0.0;
          for (int i = 0; i < MAX_STEPS; i++) {
            vec3 p = ro + rd * dO;
            float dS = mandelbulb(p);
            if (dS < SURF_DIST) return dO;
            dO += dS;
            if (dO > MAX_DIST) break;
          }
          return -1.0;
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
          uv.x *= iResolution.x / iResolution.y;

          vec3 ro = vec3(0.0, 0.0, -4.0);

          // Rotate view over time on two axes
          float maxAngle = 1.0;
          float speed = 1.0;
          float angleY = maxAngle * sin(iTime * speed);
          float angleX = 0.0;

          mat2 rotY = mat2(cos(angleY), -sin(angleY), sin(angleY), cos(angleY));

          vec3 dir = vec3(uv, 1.5);
          dir.xz = rotY * dir.xz;

          vec3 rd = normalize(dir);

          float d = rayMarch(ro, rd);

          // background gradient
          vec3 bg = mix(vec3(0.1, 0.0, 0.2), vec3(0.0, 0.0, 0.0), uv.y * 0.5 + 0.5);
          vec3 col = bg;

          if (d > 0.0) {
            // vibrant smooth palette
            vec3 palette = 0.5 + 0.5 * cos(6.2831 * (0.2 + d * 0.02) + vec3(0.0, 0.5, 1.0));
            // glow effect based on distance
            float glow = exp(-0.02 * d * d);
            col = mix(bg, palette, glow);
          }

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    const plane = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(plane);

    const animate = (time: number) => {
      requestAnimationFrame(animate);
      uniforms.iTime.value = time * 0.001;
      renderer.render(scene, camera);
    };
    animate(0);

    const handleResize = () => {
      if (!containerRef.current) return;
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      uniforms.iResolution.value.x = containerRef.current.clientWidth;
      uniforms.iResolution.value.y = containerRef.current.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '300px', height: '300px' }}
      class="border border-gray-400 rounded"
    ></div>
  );
};

export default ThreeCanvas;