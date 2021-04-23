import * as THREE from "three";

const calculateDistanceFromRay = (ray: THREE.Raycaster, clips: Array<THREE.Object3D>) => {
  const intersected = ray.intersectObjects(clips, true);

  if (intersected.length > 0) return parseFloat(intersected[0].distance.toPrecision(3));

  return 0;
}

export class CollisionCaster {
  private _position: THREE.Vector3;
  private _length: number;
  private _clips: Array<THREE.Object3D>;

  up: Number;
  down: Number;
  /*
  front: Number;
  behind: Number;
  right: Number;
  left: Number;
  */

  constructor(position, length, clips) {
    this._position = position;
    this._length = length;
    this._clips = clips;

    this.up = calculateDistanceFromRay(new THREE.Raycaster(this._position, new THREE.Vector3(0, 1, 0), 0, this._length), this._clips);
    this.down = calculateDistanceFromRay(new THREE.Raycaster(this._position, new THREE.Vector3(0, -1, 0), 0, this._length), this._clips);
    /*
    this.front = calculateDistanceFromRay(new THREE.Raycaster(this._position, new THREE.Vector3(0, -1, 0), 0, this._length), clips);
    this.behind = calculateDistanceFromRay(new THREE.Raycaster(this._position, new THREE.Vector3(0, -1, 0), 0, this._length), clips);
    this.right = calculateDistanceFromRay(new THREE.Raycaster(this._position, new THREE.Vector3(0, -1, 0), 0, this._length), clips);
    this.left = calculateDistanceFromRay(new THREE.Raycaster(this._position, new THREE.Vector3(0, -1, 0), 0, this._length), clips);
    */
  }
}
