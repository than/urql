/* @jsx h */
import { h } from 'preact';
import { cleanup, render } from '@testing-library/preact';
import { map, interval, pipe } from 'wonka';
import { Provider } from '../context';
import { Subscription } from './Subscription';

const query = 'subscription Example { example }';
const client = {
  executeSubscription: jest.fn(() =>
    pipe(
      interval(200),
      map((i: number) => ({ data: i, error: i + 1 }))
    )
  ),
};

describe('Subscription', () => {
  beforeEach(() => {
    jest.spyOn(global.console, 'error').mockImplementation();
  });

  afterEach(() => {
    cleanup();
  });

  it('Should execute the subscription', done => {
    let props = {};
    const Test = () => <p>Hi</p>;
    const App = () => {
      // @ts-ignore
      return h(Provider, {
        value: client,
        children: [
          h(
            // @ts-ignore
            Subscription,
            { query },
            ({ data, fetching, error }) => {
              props = { data, fetching, error };
              return h(Test, {});
            }
          ),
        ],
      });
    };
    render(h(App, {}));
    expect(props).toStrictEqual({
      data: undefined,
      fetching: true,
      error: undefined,
    });
    setTimeout(() => {
      expect(props).toStrictEqual({ data: 0, fetching: true, error: 1 });
      done();
    }, 300);
  });
});
