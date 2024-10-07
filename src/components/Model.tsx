import React, { useEffect, useState, useRef } from "react";
import { useFrame, extend } from "react-three-fiber";
import * as THREE from "three";
import { Html } from "drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";

extend({ ShaderMaterial: THREE.ShaderMaterial });

const Model = () => {
  const group = useRef<THREE.Group | null>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  const [mouse, setMouse] = useState([0, 0]);
  const startTime = useRef(Date.now());
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Shader uniforms
  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      u_time: { value: 0.0 },
      u_resolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      u_mouse: { value: new THREE.Vector2(0.0, 0.0) },
    },
  });

  shaderMaterialRef.current = shaderMaterial;

  // Load model
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      "/scene.gltf",
      (gltf) => {
        const loadedModel = gltf.scene;
        loadedModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = shaderMaterial;
          }
        });
        loadedModel.scale.set(75, 75, 75);
        loadedModel.position.set(-75, -75, -75);
        setModel(loadedModel);
      },
      undefined,
      (error) => {
        console.error("Error loading GLTF model:", error);
      }
    );
  }, [shaderMaterial]);

  // Mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    setMouse([event.clientX, event.clientY]);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Update uniforms with mouse and time in each frame
  useFrame(() => {
    if (shaderMaterialRef.current) {
      // Time progression
      const elapsedTime = (Date.now() - startTime.current) * 0.001; // Convert to seconds
      shaderMaterialRef.current.uniforms.u_time.value = elapsedTime;

      // Update mouse uniform
      shaderMaterialRef.current.uniforms.u_mouse.value.set(
        mouse[0] / window.innerWidth,
        1 - mouse[1] / window.innerHeight // Invert y axis for WebGL space
      );

      // Ensure resolution stays updated
      shaderMaterialRef.current.uniforms.u_resolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    }
  });

  return (
    <>
      {model ? (
        <group ref={group} dispose={null}>
          <primitive object={model} />
        </group>
      ) : (
        <Html>Loading...</Html>
      )}
    </>
  );
};

export default Model;
