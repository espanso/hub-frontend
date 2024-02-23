import type {Config} from 'jest';

const config: Config = {
  verbose: true,
  preset: "ts-jest",

  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost:3000/"
  },
};

export default config;