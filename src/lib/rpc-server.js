export default class {
  constructor(serverProcess) {
    this.serverProcess = serverProcess;
  }

  read(handler) {
    this.serverProcess.stdout.on('data', (buffer) => {
      for (const line of this.readLines(buffer)) {
        handler(JSON.parse(line));
      }
    });
  }

  write(data) {
    this.serverProcess.stdin.write(JSON.stringify(data) + '\n');
  }

  // Extract to private function pending Babel T6676
  * readLines(buffer) {
    for (const line of buffer.toString().split('\n')) {
      if (line.trim().length > 0) {
        yield line;
      }
    }
  }
}

