(Scratch => {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('Camera extension must be run unsandboxed');
  }
  
  const m4 = (function () {
    /*!
     * 4x4 matrix operation code is from https://webglfundamentals.org/webgl/resources/m4.js
     * We have made some changes:
     *  - Fixed type errors
     *  - Changed code formatting
     *  - Removed unused functions
     *
     * Copyright 2021 GFXFundamentals.
     * All rights reserved.
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    /**
     * An array or typed array with 3 values.
     * @typedef {number[]|Float32Array} Vector3
     * @memberOf module:webgl-3d-math
     */

    /**
     * An array or typed array with 4 values.
     * @typedef {number[]|Float32Array} Vector4
     * @memberOf module:webgl-3d-math
     */

    /**
     * An array or typed array with 16 values.
     * @typedef {number[]|Float32Array} Matrix4
     * @memberOf module:webgl-3d-math
     */


    let MatType = Float32Array;

    /**
     * Sets the type this library creates for a Mat4
     * @param {Float32ArrayConstructor} Ctor the constructor for the type. Either `Float32Array` or `Array`
     * @return {Float32ArrayConstructor} previous constructor for Mat4
     */
    function setDefaultType(Ctor) {
      const OldType = MatType;
      MatType = Ctor;
      return OldType;
    }


    /**
     * Computes a 4-by-4 orthographic projection matrix given the coordinates of the
     * planes defining the axis-aligned, box-shaped viewing volume.  The matrix
     * generated sends that box to the unit box.  Note that although left and right
     * are x coordinates and bottom and top are y coordinates, near and far
     * are not z coordinates, but rather they are distances along the negative
     * z-axis.  We assume a unit box extending from -1 to 1 in the x and y
     * dimensions and from -1 to 1 in the z dimension.
     * @param {number} left The x coordinate of the left plane of the box.
     * @param {number} right The x coordinate of the right plane of the box.
     * @param {number} bottom The y coordinate of the bottom plane of the box.
     * @param {number} top The y coordinate of the right plane of the box.
     * @param {number} near The negative z coordinate of the near plane of the box.
     * @param {number} far The negative z coordinate of the far plane of the box.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function orthographic(left, right, bottom, top, near, far, dst) {
      dst = dst || new MatType(16);

      dst[0] = 2 / (right - left);
      dst[1] = 0;
      dst[2] = 0;
      dst[3] = 0;
      dst[4] = 0;
      dst[5] = 2 / (top - bottom);
      dst[6] = 0;
      dst[7] = 0;
      dst[8] = 0;
      dst[9] = 0;
      dst[10] = 2 / (near - far);
      dst[11] = 0;
      dst[12] = (left + right) / (left - right);
      dst[13] = (bottom + top) / (bottom - top);
      dst[14] = (near + far) / (near - far);
      dst[15] = 1;

      return dst;
    }

 

    /**
     * Multiply by an z rotation matrix
     * @param {Matrix4} m matrix to multiply
     * @param {number} angleInRadians amount to rotate
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function zRotate(m, angleInRadians, dst) {
      // This is the optimized version of
      // return multiply(m, zRotation(angleInRadians), dst);
      dst = dst || new MatType(16);

      var m00 = m[0 * 4 + 0];
      var m01 = m[0 * 4 + 1];
      var m02 = m[0 * 4 + 2];
      var m03 = m[0 * 4 + 3];
      var m10 = m[1 * 4 + 0];
      var m11 = m[1 * 4 + 1];
      var m12 = m[1 * 4 + 2];
      var m13 = m[1 * 4 + 3];
      var c = Math.cos(angleInRadians);
      var s = Math.sin(angleInRadians);

      dst[0] = c * m00 + s * m10;
      dst[1] = c * m01 + s * m11;
      dst[2] = c * m02 + s * m12;
      dst[3] = c * m03 + s * m13;
      dst[4] = c * m10 - s * m00;
      dst[5] = c * m11 - s * m01;
      dst[6] = c * m12 - s * m02;
      dst[7] = c * m13 - s * m03;

      if (m !== dst) {
        dst[8] = m[8];
        dst[9] = m[9];
        dst[10] = m[10];
        dst[11] = m[11];
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }

      return dst;
    }

    /**
     * Multiply by a scaling matrix
     * @param {Matrix4} m matrix to multiply
     * @param {number} sx x scale.
     * @param {number} sy y scale.
     * @param {number} sz z scale.
     * @param {Matrix4} [dst] optional matrix to store result
     * @return {Matrix4} dst or a new matrix if none provided
     * @memberOf module:webgl-3d-math
     */
    function scale(m, sx, sy, sz, dst) {
      // This is the optimized version of
      // return multiply(m, scaling(sx, sy, sz), dst);
      dst = dst || new MatType(16);
      dst[0] = sx * m[0 * 4 + 0];
      dst[1] = sx * m[0 * 4 + 1];
      dst[2] = sx * m[0 * 4 + 2];
      dst[3] = sx * m[0 * 4 + 3];
      dst[4] = sy * m[1 * 4 + 0];
      dst[5] = sy * m[1 * 4 + 1];
      dst[6] = sy * m[1 * 4 + 2];
      dst[7] = sy * m[1 * 4 + 3];
      dst[8] = sz * m[2 * 4 + 0];
      dst[9] = sz * m[2 * 4 + 1];
      dst[10] = sz * m[2 * 4 + 2];
      dst[11] = sz * m[2 * 4 + 3];
      if (m !== dst) {
        dst[12] = m[12];
        dst[13] = m[13];
        dst[14] = m[14];
        dst[15] = m[15];
      }
      return dst;
    }
    return {
      orthographic: orthographic,
      zRotate: zRotate,
      scale: scale

    };
  }());
  const icon = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMjUuMzU0OCIgaGVpZ2h0PSIyMjUuMzU0OCIgdmlld0JveD0iMCwwLDIyNS4zNTQ4LDIyNS4zNTQ4Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTg3LjMyMjkzLC0zNy4zMjI1OSkiPjxnIGRhdGEtcGFwZXItZGF0YT0ieyZxdW90O2lzUGFpbnRpbmdMYXllciZxdW90Ozp0cnVlfSIgZmlsbC1ydWxlPSJub256ZXJvIiBzdHJva2U9Im5vbmUiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMTg3LjMyMjk0LDE1MGMwLC02Mi4yMzAwMSA1MC40NDczOSwtMTEyLjY3NzQgMTEyLjY3NzQsLTExMi42Nzc0YzYyLjIzMDAxLDAgMTEyLjY3NzQsNTAuNDQ3MzkgMTEyLjY3NzQsMTEyLjY3NzRjMCw2Mi4yMzAwMSAtNTAuNDQ3MzksMTEyLjY3NzQgLTExMi42Nzc0LDExMi42Nzc0Yy02Mi4yMzAwMSwwIC0xMTIuNjc3NCwtNTAuNDQ3MzkgLTExMi42Nzc0LC0xMTIuNjc3NHoiIGZpbGw9IiNmZjRkYTciIHN0cm9rZS13aWR0aD0iMCIvPjxnPjxwYXRoIGQ9Ik0zMTcuMTAyOSw4MC44MTA4N2MyMS44OTI0LDAgMzkuNjYyMDcsMTcuNzM3MjMgMzkuNjYyMDcsMzkuNjM0NGMwLDEyLjMwNTE3IC01LjYxMTQ4LDIzLjI5NjIyIC0xNC40MDA4OCwzMC41NjgyNGg4Ljc3MDMydjY4LjE3NTYzaC0xMTQuMTMzMjV2LTU1Ljc5ODg5Yy0xNC4zMzQwOCwtMy41MjgxNyAtMjQuOTYxNTMsLTE2LjQ1NzQ3IC0yNC45NjE1MywtMzEuODgwNDRjMCwtMTguMTM5IDE0LjY5NjczLC0zMi44MzQ3OCAzMi44MzQ3OCwtMzIuODM0NzhjMTIuMDM3OTUsMCAyMi41NTY2MSw2LjQ3ODAxIDI4LjI3MjExLDE2LjEzMzk1bDQuODYxMzcsLTAuOTI0NzVjMy4xMjkyNiwtMTguNzY2OTYgMTkuNDM5NzYsLTMzLjA3MzM2IDM5LjA5OTAyLC0zMy4wNzMzNnpNMjc2LjIxODUxLDE0MS4yOTE3MWMtMS4xMDAzNSwzLjUzMzg5IC0yLjc2OTQ3LDYuODEyMDMgLTQuOTIwNTQsOS43MjE3OWgyMC41NDc3NGMtMy42ODc1NCwtMy4wNDgxNCAtNi44MDI0OCwtNi43NjUyNyAtOS4xODU0NSwtMTAuOTQ0Mjl6IiBmaWxsPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48cGF0aCBkPSJNMzM2LjU3NTI5LDExOS41MjgxNWMwLDExLjA2ODM1IC04Ljk3MjY0LDIwLjA0MDk5IC0yMC4wNDA5OSwyMC4wNDA5OWMtMTEuMDY4MzUsMCAtMjAuMDQwOTksLTguOTcyNjQgLTIwLjA0MDk5LC0yMC4wNDA5OWMwLC0xMS4wNjgzNSA4Ljk3MjY0LC0yMC4wNDA5OSAyMC4wNDA5OSwtMjAuMDQwOTljMTEuMDY4MzUsMCAyMC4wNDA5OSw4Ljk3MjY0IDIwLjA0MDk5LDIwLjA0MDk5eiIgZmlsbD0iI2ZmNGRhNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48cGF0aCBkPSJNMjYxLjE4MywxMzAuMDI1ODFjMCw4Ljk2MDA0IC03LjI2MzYyLDE2LjIyMzY2IC0xNi4yMjM2NiwxNi4yMjM2NmMtOC45NjAwNCwwIC0xNi4yMjM2NiwtNy4yNjM2MiAtMTYuMjIzNjYsLTE2LjIyMzY2YzAsLTguOTYwMDQgNy4yNjM2MiwtMTYuMjIzNjYgMTYuMjIzNjYsLTE2LjIyMzY2YzguOTYwMDQsMCAxNi4yMjM2Niw3LjI2MzYyIDE2LjIyMzY2LDE2LjIyMzY2eiIgZmlsbD0iI2ZmNGRhNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48cGF0aCBkPSJNMzg3Ljk2MDM5LDE0NS44NTcyNHY2MC41MTA0M2wtMjEuNjAzMjYsLTEzLjQ3MjE3aC0xNi44OTgzNHYtMzMuNTY2MDdoMTYuODk4MzRsMjEuNTk5MTcsLTEzLjQ3MTEyeiIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvZz48L2c+PC9zdmc+PCEtLXJvdGF0aW9uQ2VudGVyOjExMi42NzcwNjU6MTEyLjY3NzQwNS0tPg==';
  const turnLeftIcon = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMS4yNjk4MiIgaGVpZ2h0PSIyMC4wMzE0NSIgdmlld0JveD0iMCwwLDIxLjI2OTgyLDIwLjAzMTQ1Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjg5LjA3NDM0LC0xNDAuMzk5OTkpIj48ZyBkYXRhLXBhcGVyLWRhdGE9InsmcXVvdDtpc1BhaW50aW5nTGF5ZXImcXVvdDs6dHJ1ZX0iIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMzA4LjM0LDE1Ni4yMWMtMS44ODg0MSwyLjU5OTU1IC00Ljg4NzQ2LDQuMTYyMDMgLTguMSw0LjIyYy0xLjI0ODE2LDAuMDQ0MTggLTIuMjk1ODIsLTAuOTMxODQgLTIuMzQsLTIuMThjLTAuMDQ0MTgsLTEuMjQ4MTYgMC45MzE4NCwtMi4yOTU4MiAyLjE4LC0yLjM0djBjMS43MzM0NywtMC4xMzUxMiAzLjMwNDg4LC0xLjA3MDU4IDQuMjUsLTIuNTNjMC45MTkxMSwtMS4zNjExIDEuMTIwNDQsLTMuMDgzNjIgMC41NCwtNC42MmMtMC4yNzc5LC0wLjY5MjM1IC0wLjczMzE1LC0xLjI5OTM2IC0xLjMyLC0xLjc2Yy0wLjU4ODIxLC0wLjQzMTY1IC0xLjI3NjM3LC0wLjcwNjkxIC0yLC0wLjhjLTEuMTEwOTUsLTAuMTA2MDQgLTIuMjI0MjgsMC4xNzY3MSAtMy4xNSwwLjhsMS4xMiwxLjQxYzAuMzc3ODMsMC40NjU3IDAuNDYxNDksMS4xMDQzNyAwLjIxNjM3LDEuNjUxNjdjLTAuMjQ1MTMsMC41NDczMSAtMC43NzczNCwwLjkxMDE0IC0xLjM3NjM3LDAuOTM4MzNoLTcuNjljLTAuNDk2MywwLjAwMjM5IC0wLjk2NDEzLC0wLjIzMTUyIC0xLjI2LC0wLjYzYy0wLjMwNzIzLC0wLjM4NTUzIC0wLjQxMTMyLC0wLjg5NDg0IC0wLjI4LC0xLjM3bDEuNzIsLTcuNDNjMC4xODg4OSwtMC42ODk2NyAwLjgxNDkzLC0xLjE2ODQxIDEuNTMsLTEuMTdjMC40ODM2OSwtMC4wMDE2OSAwLjk0MTE2LDAuMjE5NjcgMS4yNCwwLjZsMS4wOCwxLjM1YzIuMjYzMTYsLTEuNTI4MTUgNS4wMjY0NywtMi4xMjk0OSA3LjcyLC0xLjY4YzEuNjg2NDIsMC4zMDQwOCAzLjI2NDc1LDEuMDQxNTUgNC41OCwyLjE0YzEuMzAwNDMsMS4xMTkwMiAyLjI3NzU4LDIuNTY1NzYgMi44Myw0LjE5YzEuMDM5NDgsMy4xMjg5MyAwLjQ4MzAzLDYuNTY4NDQgLTEuNDksOS4yMXoiIGZpbGw9IiNjYzNkODUiLz48cGF0aCBkPSJNMzA3LjU2LDE1NS42NWMtMS43MTMyLDIuMzU5MzYgLTQuNDM0NzEsMy43Nzc1MSAtNy4zNSwzLjgzYy0wLjcyMzQ5LDAuMDIyMDkgLTEuMzI3OTEsLTAuNTQ2NTEgLTEuMzUsLTEuMjdjLTAuMDIyMDksLTAuNzIzNDkgMC41NDY1MSwtMS4zMjc5MSAxLjI3LC0xLjM1YzIuMDMwNjksLTAuMTQwODIgMy44Nzk1NSwtMS4yMjA1NiA1LC0yLjkyYzEuMTAyMzksLTEuNjE5ODEgMS4zNTIwOCwtMy42NzMyIDAuNjcsLTUuNTFjLTAuMzUwODgsLTAuODQ5NTkgLTAuOTE1OTEsLTEuNTkzNzcgLTEuNjQsLTIuMTZjLTAuNzI1NTksLTAuNTQzNDEgLTEuNTgwNDEsLTAuODg4MSAtMi40OCwtMWMtMS43MTUwNywtMC4xOTEzIC0zLjQyNzI3LDAuMzgzMDkgLTQuNjgsMS41N2wxLjc0LDIuMTZjMC4xNjUzLDAuMTcxMDMgMC4yMTE3NCwwLjQyNDU5IDAuMTE3NzgsMC42NDMwOWMtMC4wOTM5NiwwLjIxODUxIC0wLjMwOTk0LDAuMzU5MjMgLTAuNTQ3NzgsMC4zNTY5MWgtNy42MWMtMC4xODg5LDAuMDA2MDMgLTAuMzY5NTksLTAuMDc3MyAtMC40ODc2NSwtMC4yMjQ4OGMtMC4xMTgwNiwtMC4xNDc1OCAtMC4xNTk2OSwtMC4zNDIxNiAtMC4xMTIzNSwtMC41MjUxMmwxLjcxLC03LjQyYzAuMDY1NjUsLTAuMjAwMjcgMC4yMzMxNCwtMC4zNTAzMSAwLjQzOTM5LC0wLjM5MzYyYzAuMjA2MjUsLTAuMDQzMzEgMC40MTk5NSwwLjAyNjY4IDAuNTYwNjEsMC4xODM2MmwxLjY3LDIuMWMyLjE2NDI3LC0xLjc3NDcgNC45ODkwNywtMi41MjkyIDcuNzUsLTIuMDdjMS41MTcyMSwwLjI2OTk1IDIuOTM3NSwwLjkzMTgzIDQuMTIsMS45MmMxLjE1OTI3LDAuOTk0ODggMi4wMzU0NCwyLjI3ODA5IDIuNTQsMy43MmMwLjk1MTYxLDIuODM2MzkgMC40NTQ4NCw1Ljk1ODk1IC0xLjMzLDguMzZ6IiBmaWxsPSIjZmZmZmZmIi8+PC9nPjwvZz48L3N2Zz48IS0tcm90YXRpb25DZW50ZXI6MTAuOTI1NjYzOTg1MDY1OjkuNjAwMDA5NjE3NzQ4MDcxLS0+'
  const turnRightIcon = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyMS4yNjE4MSIgaGVpZ2h0PSIyMC4wMzE0NSIgdmlld0JveD0iMCwwLDIxLjI2MTgxLDIwLjAzMTQ1Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjg5Ljc0MDMzLC0xNDAuMjI5OTkpIj48ZyBkYXRhLXBhcGVyLWRhdGE9InsmcXVvdDtpc1BhaW50aW5nTGF5ZXImcXVvdDs6dHJ1ZX0iIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMzEwLjY4LDE1MC4yYy0wLjMwMjEyLDAuMzk2MzIgLTAuNzcxNjYsMC42MjkyNCAtMS4yNywwLjYzaC03LjY5Yy0wLjU5NTI3LC0wLjAzMDkyIC0xLjEyMzI1LC0wLjM5MjE5IC0xLjM2NzY5LC0wLjkzNTg1Yy0wLjI0NDQzLC0wLjU0MzY1IC0wLjE2NDI2LC0xLjE3ODM2IDAuMjA3NjksLTEuNjQ0MTVsMS4xMiwtMS40MWMtMC45MjY4MSwtMC42MTA1MSAtMi4wMzU5LC0wLjg4MjQ4IC0zLjE0LC0wLjc3Yy0wLjcyMzYzLDAuMDkzMDkgLTEuNDExNzksMC4zNjgzNSAtMiwwLjhjLTAuNTkwMDEsMC40NDk4MiAtMS4wNTE5OSwxLjA0NjI2IC0xLjM0LDEuNzNjLTAuNTgwNDQsMS41MzYzOCAtMC4zNzkxMSwzLjI1ODkgMC41NCw0LjYyYzAuOTQ5NCwxLjQ1ODI4IDIuNTI0NzUsMi4zOTAxOCA0LjI2LDIuNTJ2MGMxLjI0ODE2LDAuMDQ0MTggMi4yMjQxOCwxLjA5MTg0IDIuMTgsMi4zNGMtMC4wNDQxOCwxLjI0ODE2IC0xLjA5MTg0LDIuMjI0MTggLTIuMzQsMi4xOGMtMy4yMTkyNSwtMC4wNjg4OSAtNi4yMTkwMSwtMS42NDY1NCAtOC4xLC00LjI2Yy0xLjk2NjcyLC0yLjY0ODA1IC0yLjUyMjUyLC02LjA4NzI1IC0xLjQ5LC05LjIyYzAuNTY0MTMsLTEuNjA0MjEgMS41NDAwOCwtMy4wMzE5MiAyLjgzLC00LjE0YzEuMzE2MjQsLTEuMDk2ODkgMi44OTQxNCwtMS44MzQxNiA0LjU4LC0yLjE0YzIuNjkzNTMsLTAuNDQ5NDkgNS40NTY4NCwwLjE1MTg1IDcuNzIsMS42OGwxLjA4LC0xLjM1YzAuMjk4ODQsLTAuMzgwMzMgMC43NTYzMSwtMC42MDE2OSAxLjI0LC0wLjZjMC43MjkwNiwwLjAwNTM2IDEuMzYyMzEsMC41MDI5IDEuNTQsMS4yMWwxLjcsNy4zN2MwLjEzODcxLDAuNDc4MzUgMC4wNDIyNCwwLjk5NDEzIC0wLjI2LDEuMzl6IiBmaWxsPSIjY2MzZDg1Ii8+PHBhdGggZD0iTTMwOS4zOCwxNDkuODNoLTcuNjFjLTAuMjM3ODQsMC4wMDIzMiAtMC40NTM4MiwtMC4xMzg0IC0wLjU0Nzc4LC0wLjM1NjkxYy0wLjA5Mzk2LC0wLjIxODUxIC0wLjA0NzUyLC0wLjQ3MjA3IDAuMTE3NzgsLTAuNjQzMDlsMS43NSwtMi4xOWMtMS4yNTg1OCwtMS4xOTEzOCAtMi45NzczMiwtMS43NjkxNyAtNC43LC0xLjU4Yy0xLjg0ODAzLDAuMjIyMTEgLTMuNDI1NzYsMS40MzkgLTQuMTEsMy4xN2MtMC42ODY3OSwxLjg1MjU4IC0wLjQxNzUxLDMuOTI0NTIgMC43Miw1LjU0YzEuMTE4MjYsMS43MDE3NSAyLjk2ODM4LDIuNzgyMjIgNSwyLjkyYzAuNzIzNDksMC4wMjIwOSAxLjI5MjA5LDAuNjI2NTEgMS4yNywxLjM1Yy0wLjAyMjA5LDAuNzIzNDkgLTAuNjI2NTEsMS4yOTIwOSAtMS4zNSwxLjI3Yy0yLjkxMzEyLC0wLjA1MTcgLTUuNjMzNjQsLTEuNDY1NjMgLTcuMzUsLTMuODJjLTEuODA4ODYsLTIuMzkyNTMgLTIuMzMxODIsLTUuNTE5MDYgLTEuNCwtOC4zN2MwLjQ5NzE3LC0xLjQ0NTYzIDEuMzc0NTcsLTIuNzMwNjUgMi41NCwtMy43MmMxLjE3NzY1LC0wLjk4OTc4IDIuNTk1MTgsLTEuNjUxOTggNC4xMSwtMS45MmMyLjc2MDkzLC0wLjQ1OTIgNS41ODU3MywwLjI5NTMgNy43NSwyLjA3bDEuNjcsLTIuMWMwLjE0MDY2LC0wLjE1Njk0IDAuMzU0MzYsLTAuMjI2OTMgMC41NjA2MSwtMC4xODM2MmMwLjIwNjI1LDAuMDQzMzEgMC4zNzM3NCwwLjE5MzM1IDAuNDM5MzksMC4zOTM2MmwxLjc2LDcuNDJjMC4wNTM1MywwLjE4NyAwLjAxMTQ1LDAuMzg4MzcgLTAuMTEyNDgsMC41MzgyOGMtMC4xMjM5MywwLjE0OTkyIC0wLjMxMzc5LDAuMjI5MTIgLTAuNTA3NTIsMC4yMTE3MnoiIGZpbGw9IiNmZmZmZmYiLz48L2c+PC9nPjwvc3ZnPjwhLS1yb3RhdGlvbkNlbnRlcjoxMC4yNTk2NzExOTA1MzM3NjY6OS43NzAwMDk2MTc3NDgwODctLT4='
  const vm = Scratch.vm;

  let cameraX = 0;
  let cameraY = 0;
  let cameraRotation = 0;
  let cameraZoom = 100;
  let cameraBG = '#ffffff';

  vm.runtime.runtimeOptions.fencing = false;
  vm.renderer.offscreenTouching = true;
 /**
 *   Source: github.com/TurboWarp/scratch-render/blob/develop/src/RenderWebGL.js
 */
  function setStageSize (xLeft, xRight, yBottom, yTop,Rotation) {
      var orthoProjection = m4.orthographic(xLeft, xRight, yTop, yBottom, -1, 1);
      m4.zRotate(orthoProjection,Rotation * Math.PI / 180.0, orthoProjection);
      m4.scale(orthoProjection, 1, -1, 1, orthoProjection);
      vm.renderer._projection = orthoProjection;
      vm.renderer._setNativeSize(Math.abs(xRight - xLeft), Math.abs(yBottom - yTop));
  }
  function updateCamera() {
    setStageSize(
      vm.runtime.stageWidth / -2 + cameraX,
      vm.runtime.stageWidth / 2 + cameraX,
      vm.runtime.stageHeight / -2 + cameraY,
      vm.runtime.stageHeight / 2 + cameraY,
      cameraRotation
    );
    vm.renderer._projection[15] = 100 / cameraZoom;
  }

  // tell resize to update camera as well
  vm.runtime.on('STAGE_SIZE_CHANGED', _=>updateCamera());

  function doFix() {
    //vm.runtime.emit('STAGE_SIZE_CHANGED', vm.runtime.stageWidth, vm.runtime.stageHeight);
    updateCamera()
  }

  // fix mouse positions
  let oldSX = vm.runtime.ioDevices.mouse.getScratchX;
  let oldSY = vm.runtime.ioDevices.mouse.getScratchY;

  vm.runtime.ioDevices.mouse.getScratchX = function(...a){
    return (oldSX.apply(this, a) + cameraX) / cameraZoom * 100;
  };
  vm.runtime.ioDevices.mouse.getScratchY = function(...a){
    return (oldSY.apply(this, a) + cameraY) / cameraZoom * 100;
  };

  class Camera {

    getInfo() {
      return {

        id: 'DTcameracontrols',
        name: 'Camera',

        color1: '#ff4da7',
        color2: '#b93778',
        color3: '#b93778',

        menuIconURI: icon,

        blocks: [
          {
            opcode: 'setBoth',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set camera to x: [x] y: [y]',
            arguments: {
              x: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              },
              y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              },
            }
          },
          '---',
          {
            opcode: 'changeZoom',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change camera zoom by [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10
              }
            }
          },
          {
            opcode: 'setZoom',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set camera zoom to [val] %',
            arguments: {
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100
              }
            }
          },
          '---',
          {
            opcode: 'changeX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change camera x by [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10
              }
            }
          },
          {
            opcode: 'setX',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set camera x to [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          {
            opcode: 'changeY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'change camera y by [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 10
              }
            }
          },
          {
            opcode: 'setY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set camera y to [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          {
            opcode: 'setDir',
            blockType: Scratch.BlockType.COMMAND,
            text: 'point camera in direction [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0
              }
            }
          },
          {
            opcode: 'turnDirLeft',
            blockType: Scratch.BlockType.COMMAND,
            text: 'turn camera [IMAGE][val] degrees',
            arguments: {
              IMAGE: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: turnLeftIcon
              },
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5
              }
            }
          },
          {
            opcode: 'turnDirRight',
            blockType: Scratch.BlockType.COMMAND,
            text: 'turn camera [IMAGE] [val] degrees',
            arguments: {
              IMAGE: {
                type: Scratch.ArgumentType.IMAGE,
                dataURI: turnRightIcon
              },
              val: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5
              }
            }
          },
          "---",
          {
            opcode: 'getX',
            blockType: Scratch.BlockType.REPORTER,
            text: 'camera x',
          },
          {
            opcode: 'getY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'camera y',
          },
          {
            opcode: 'getDir',
            blockType: Scratch.BlockType.REPORTER,
            text: 'camera direction',
          },
          {
            opcode: 'getZoom',
            blockType: Scratch.BlockType.REPORTER,
            text: 'camera zoom',
          },
          '---',
          {
            opcode: 'setCol',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set background color to [val]',
            arguments: {
              val: {
                type: Scratch.ArgumentType.COLOR
              }
            }
          },
          {
            opcode: 'getCol',
            blockType: Scratch.BlockType.REPORTER,
            text: 'background color',
          },
        ]
      };
    }

    setBoth(ARGS) {
      cameraX = +ARGS.x;
      cameraY = +ARGS.y;
      doFix();
    }
    changeZoom(ARGS) {
      cameraZoom += +ARGS.val;
      doFix();
    }
    setZoom(ARGS) {
      cameraZoom = +ARGS.val;
      doFix();
    }
    changeX(ARGS) {
      cameraX += +ARGS.val;
      doFix();
    }
    setX(ARGS) {
      cameraX = +ARGS.val;
      doFix();
    }
    turnDirRight(ARGS){
      cameraRotation += +ARGS.val;
      doFix();
    }
    turnDirLeft(ARGS){
      cameraRotation -= +ARGS.val;
      doFix();
    }
    setDir(ARGS) {
      cameraRotation = +ARGS.val;
      doFix();
    }
    changeY(ARGS) {
      cameraY += +ARGS.val;
      doFix();
    }
    setY(ARGS) {
      cameraY = +ARGS.val;
      doFix();
    }
    getX() {
      return cameraX;
    }
    getY() {
      return cameraY;
    }
    getDir() {
      return cameraRotation;
    }
    getZoom() {
      return cameraZoom;
    }
    setCol(ARGS) {
      cameraBG = ARGS.val;
      Scratch.vm.renderer.setBackgroundColor(
        parseInt(cameraBG.substring(1,3),16) / 255,
        parseInt(cameraBG.substring(3,5),16) / 255,
        parseInt(cameraBG.substring(5,7),16) / 255
      );
    }
    getCol() {
      return cameraBG;
    }

  }

  Scratch.extensions.register(new Camera());
})(Scratch);