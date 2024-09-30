import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import { Html } from "drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import vertexShader from "../shaders/vertexShader.glsl";
import fragmentShader from "../shaders/fragmentShader.glsl";

const Model = () => {
  const group = useRef<THREE.Group | null>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  //const shaderMaterial = new THREE.ShaderMaterial()

  const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });

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
  }, []);

  // Mouse movement
  const handleMouseMove = (event: MouseEvent) => {
    if (group.current) {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      group.current.rotation.y = x * Math.PI; // Rotate based on mouse X
      group.current.rotation.x = y * Math.PI; // Rotate based on mouse Y
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

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
