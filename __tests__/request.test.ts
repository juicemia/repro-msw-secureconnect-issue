import 'dotenv/config'
import { NodeHttpClient } from '../src/net/NodeHttpClient'
import { http, type HttpHandler, HttpResponse } from 'msw'
import { type SetupServerApi, setupServer } from 'msw/node'

describe('NodeHttpClient', () => {  
  it('works out of the box', async () => {
    const client = new NodeHttpClient()
    
    const response = await client.makeRequest(
      'httpbin.org',
      '443',
      '/get',
      'GET',
      {
        'accept': 'application/json'
      },
      '',
      'https',
      10 * 1000 // 10 seconds
    )

    expect(response.getStatusCode()).toEqual(200)
  })

  it('it does not work with msw', async () => {
    // Make an HTTP request before starting MSW just to make sure everything is ok.
    const client = new NodeHttpClient()
    {
      const response = await client.makeRequest(
        'httpbin.org',
        '443',
        '/get',
        'GET',
        {
          'accept': 'application/json'
        },
        '',
        'https',
        10 * 1000 // 10 seconds
      )

      expect(response.getStatusCode()).toEqual(200)
    }

    // Start MSW.
    const server = runMSW()

    {
      const response = await client.makeRequest(
        'httpbin.org',
        '443',
        '/get',
        'GET',
        {
          'accept': 'application/json'
        },
        '',
        'https',
        10 * 1000 // 10 seconds
      )
      expect(response.getStatusCode()).toEqual(200)
    }

    server.close()
  }, 20 * 1000) // Time out after 20 seconds, double the HTTP timeout
})

describe('msw', () => {
  let server: SetupServerApi;
  beforeAll(() => {
    server = runMSW()
  })

  afterAll(() => {
    server?.close();
  })

  it('works', async () => {
    const response = await fetch('https://www.google.com')
    const data = await response.text()

    expect(data).toEqual('not google')
  })

  it('only mocks the URL it is configured to mock', async () => {
    const response = await fetch('https://httpbin.org/get')
    const data: { [key: string]: any } = await response.json() as { [key: string]: any }

    expect(data['url']).toEqual('https://httpbin.org/get')
  })
})

function runMSW() {
  const handler: HttpHandler = http.get(new URL('/', 'https://www.google.com').href, () =>
      HttpResponse.text('not google')
    )

  const server = setupServer(handler)
  server.listen({ onUnhandledRequest: 'bypass' })

  return server
}