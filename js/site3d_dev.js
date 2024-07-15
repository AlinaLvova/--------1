import * as THREE from 'three';

const { Vector3, Matrix4 } = THREE; // Добавляем импорт Vector3 и Matrix4 из THREE

/**
 Класс операций над объектами three.js
 @class Site3dThree
 @constructor
 @param    {Scene} scene    Объект сцены
 */
export class Site3dThree {
  /**
   Метод возвращает массив мешей объекта three.js
   @method getObject3dMeshes
   @param     {Object3D} object3d    Объект three.js
   @param     {object} options       Дополнительные параметры:
   - exceptions - массив имен мешей для исключения
   @return    {Mesh[]}               Массив мешей
   */
  getObject3dMeshes(object3d, options = undefined) {
    if (object3d.isMesh) {
      return [object3d];
    }

    const exceptions = options?.exceptions ?? [];

    const result = [];

    object3d.traverse(child => {
      if (child.isMesh && exceptions.find(name => name === child.name) === undefined) {
        result.push(child);
      }
    });

    return result;
  }

  /**
   Метод устанавливает позицию объекта three.js в его геометрическом центре
   @method object3dToBoundCenter
   @param    {Object3D} object3d    Объект three.js
   @param    {object} options       Дополнительные параметры
   */
  object3dToBoundCenter(object3d, options = undefined) {
    this.getObject3dMeshes(object3d).forEach(mesh => {
      this.meshToBoundCenter(mesh);
    });
  }

  /**
   Метод инициализирует начальные параметры меша
   @method meshInitParams
   @param    {Mesh} mesh   Клонируемый еши
   */
   meshInitParams(mesh) {
    mesh.userData.initParams = {
        position: mesh.position.clone(),
        scale: mesh.scale.clone(),
        rotation: mesh.rotation.clone(),
        matrixWorld: mesh.matrixWorld.clone() // Сохраняем начальную матрицу мировых координат
    };
}

meshToBoundCenter(mesh, options = undefined) {
    if (mesh.isSkinnedMesh || mesh.userData.isBoundCenter === true) {
        return mesh.position;
    }

    this.meshInitParams(mesh);

    const geometry = mesh.geometry;
    const center = new Vector3();
    const worldMatrix = mesh.matrixWorld.clone(); // Матрица мировых координат меша

    // Вычисляем центр ограничивающего параллелепипеда в мировых координатах
    geometry.computeBoundingBox();
    const boundingBox = geometry.boundingBox;

    if (boundingBox) {
        // Применяем трансформации меша к ограничивающему параллелепипеду
        boundingBox.applyMatrix4(worldMatrix);

        // Вычисляем центр ограничивающего параллелепипеда в мировых координатах
        boundingBox.getCenter(center);
    }

    // Центрируем геометрию меша относительно его локальных координат
    geometry.center();

    // Восстанавливаем начальные трансформации после центрирования
    const initParams = mesh.userData.initParams;
    mesh.position.copy(initParams.position);
    mesh.scale.copy(initParams.scale);
    mesh.rotation.copy(initParams.rotation);

    // Применяем начальную матрицу мировых координат к центру
    return center.applyMatrix4(worldMatrix);
}
}