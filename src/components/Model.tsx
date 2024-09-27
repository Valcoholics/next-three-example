import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three";
import { Html } from "drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Object3D } from "three/src/core/Object3D"; // Object3D types
import { AnimationClip } from "three/src/animation/AnimationClip"; // Animation types

interface GroupRef {
  current: {
    rotation: {
      x: number;
      y: number;
    };
  };
}

interface ActionsRef {
  current: {
    idle: {
      play: () => void;
    };
  } | null;
}

const Model = () => {
  /* Refs */
  const group = useRef<GroupRef | null>(null);
  const actions = useRef<ActionsRef | null>(null);

  /* State */
  const [model, setModel] = useState<Object3D | null>(null);
  const [animation, setAnimation] = useState<AnimationClip[] | null>(null);

  /* Mixer */
  const [mixer] = useState(() => new THREE.AnimationMixer(null));

  /* Load model */
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      "scene.gltf",
      async (gltf) => {
        try {
          const nodes = await gltf.parser.getDependencies("node");
          const animations = await gltf.parser.getDependencies("animation");

          // Ensure the model and animations are valid before setting
          if (
            nodes &&
            nodes.length > 0 &&
            animations &&
            animations.length > 0
          ) {
            setModel(nodes[0]);
            setAnimation(animations);
          } else {
            console.warn("GLTF model or animations are missing or invalid.");
          }
        } catch (error) {
          console.error("Error loading GLTF model:", error);
        }
      },
      undefined,
      (error) => {
        console.error("Error occurred while loading the model:", error);
      }
    );
  }, []);

  /* Set animation */
  useEffect(() => {
    if (animation && group.current) {
      const idleAction = mixer.clipAction(
        animation[0],
        (group.current as unknown) as Object3D
      );
      if (idleAction) {
        actions.current = { idle: idleAction };
        actions.current.idle.play();
      }

      return () => {
        if (animation) {
          animation.forEach((clip) => mixer.uncacheClip(clip));
        }
      };
    }
  }, [animation, mixer]);

  /* Animation update */
  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
  });

  /* Rotation */
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      {model ? (
        <group ref={group} position={[0, -150, 0]} dispose={null}>
          <primitive name="Object_0" object={model} />
        </group>
      ) : (
        <Html>Loading...</Html>
      )}
    </>
  );
};

export default Model;
