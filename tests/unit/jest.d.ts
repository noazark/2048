declare namespace jest {
  interface Matchers<R> {
    toEqualMatrix(actual: Matrix): R;
    toEqualMatrixTiles(actual: Tile[]): R;
  }
}
