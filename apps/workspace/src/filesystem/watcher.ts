// // filesystem/watcher.ts

// import chokidar from "chokidar";

// export class WorkspaceWatcher {
//   constructor(private emit: (data: any) => void) {}

//   start() {
//     chokidar
//       .watch("/workspace", {
//         ignoreInitial: true,
//       })
//       .on("all", (event, path) => {
//         this.emit({
//           type: "file:changed",
//           event,
//           path,
//         });
//       });
//   }
// }
