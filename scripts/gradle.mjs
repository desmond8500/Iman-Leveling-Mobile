// Lance Gradle dans android/ (gradlew ou gradlew.bat selon le système) après avoir vérifié
// que le JDK est en version 21 ou plus. Capacitor 8 compile en Java 21 : avec un JDK plus
// ancien, Gradle échoue avec « invalid source release: 21 ».
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const REQUIRED_JAVA = 21;

function javaMajor() {
  const home = process.env.JAVA_HOME;
  const bin = home ? join(home, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
  const result = spawnSync(bin, ['-version'], { encoding: 'utf8' });
  if (result.error) return { bin, major: null };
  // « openjdk version "21.0.4" », « java version "1.8.0_392" » (Java 8 s'écrit 1.8)
  const match = /version "(\d+)(?:\.(\d+))?/.exec(`${result.stderr}${result.stdout}`);
  if (!match) return { bin, major: null };
  const first = Number(match[1]);
  return { bin, major: first === 1 ? Number(match[2]) : first };
}

const { bin, major } = javaMajor();
if (major === null) {
  console.error(`Java introuvable (${bin}). Installe un JDK ${REQUIRED_JAVA} et définis JAVA_HOME.`);
  process.exit(1);
}
if (major < REQUIRED_JAVA) {
  console.error(
    `Le JDK utilisé est en version ${major}, il faut ${REQUIRED_JAVA} ou plus (${bin}).\n` +
      `Installe un JDK ${REQUIRED_JAVA} (ou utilise celui d'Android Studio : dossier « jbr ») puis définis JAVA_HOME :\n` +
      `  Linux/macOS : export JAVA_HOME=/chemin/vers/jdk-${REQUIRED_JAVA}\n` +
      `  Windows     : setx JAVA_HOME "C:\\chemin\\vers\\jdk-${REQUIRED_JAVA}" (puis rouvre le terminal)`,
  );
  process.exit(1);
}

const wrapper = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const run = spawnSync(wrapper, process.argv.slice(2), { cwd: 'android', stdio: 'inherit', shell: process.platform === 'win32' });
process.exit(run.status ?? 1);
