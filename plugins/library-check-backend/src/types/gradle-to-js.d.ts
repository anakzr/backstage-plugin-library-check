declare module 'gradle-to-js' {
  interface GradleDependency {
    group: string;
    name: string;
    version: string;
  }

  interface GradleDependencies {
    [config: string]: GradleDependency[];
  }

  interface GradleJSON {
    dependencies: GradleDependencies;
  }

  export function parseText(text: string): GradleJSON;
}
