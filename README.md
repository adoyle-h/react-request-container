# react-request-container

A simple React higher-order component for request.

## TOC

<!-- MarkdownTOC GFM -->

- [Dependencies](#dependencies)
- [Install](#install)
    - [CDN](#cdn)
- [Usage](#usage)
- [Example](#example)
    - [Simplest usage](#simplest-usage)
    - [Transform data after fetch](#transform-data-after-fetch)
    - [Refetch when conditions changed](#refetch-when-conditions-changed)
    - [Wait for conditions available](#wait-for-conditions-available)
    - [Integration with redux saga](#integration-with-redux-saga)
- [Customize](#customize)
    - [Set default config for each Request container](#set-default-config-for-each-request-container)
    - [Set config for special Request container](#set-config-for-special-request-container)
- [API](#api)
    - [Request](#request)
    - [RequestFactory.make(props)](#requestfactorymakeprops)
- [Versioning](#versioning)
- [Copyright and License](#copyright-and-license)

<!-- /MarkdownTOC -->


## Dependencies

See the `dependencies` field of [`package.json`](./package.json).

## Install

```sh
npm i -S react-request-container
```

### CDN

If you prefer to exclude `react-request-container` from your application and use it globally via `window.RequestContainer`,
the package distributions are hosted on the following CDNs:

```html
<!-- development version -->
<script src=""></script>

<!-- production version -->
<script src=""></script>
```

## Usage

The react-request-container provides a React class `Request` and a helper function `RequestFactory.make`.

```jsx
import {Request, RequestFactory} from 'react-request-container';
```

The `Request` container has no responsibility for fetching data.
It only do two things: trigger for request, and show presentations for each request status.

Request status order:

- Initial : Start to send request after mount
- Pending : Show it immediately. Defaults to render null;
- Loading : If request time too long
- Loaded  : Request success
- Failed  : Request failed


## Example

The way to fetch data is under your fully control. And it is your responsibility for picking up the data and handling other situations such as request timeout.

For example, assume that there is a async function to fetch data.

```js
async function fetchData(id) {
    return fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then(response => response.json());
}
```

### Simplest usage

```jsx
const Component = () => <Request
    fetch={() => fetchData(1)}
>
    {
        (data) => <pre>{JSON.stringify(data)}</pre>
    }
</Request>;
```

The `fetch` will be invoked once immediately when `<Request>` mount. And no more invoked when re-rendered.

The inner children in `<Request>` must be a function whose parameter is passed from the returned result of `fetch` function.

### Transform data after fetch

```jsx
const Component = () => <Request
    fetch={() => fetchData(1)}
    afterFetch={(data) => data.body}
>
    {
        (body) => <pre>{JSON.stringify(body)}</pre>
    }
</Request>;
```

if `afterFetch` is defined, the children function's parameter will be passed from `afterFetch`
whose parameter is passed from the returned result of `fetch` function.

### Refetch when conditions changed

```jsx
const Component = ({id}) => <Request
    inputs={[id]}
    fetch={() => fetchData()}
>
    {
        (data) => <pre>{JSON.stringify(data)}</pre>
    }
</Request>;

const id = 1;
<Component id={id} />
```

The `inputs` must be an array composed of conditions. It will trigger re-fetch when any condition changed.

### Wait for conditions available

```jsx
const Component = ({id}) => <Request
    enable={id !== undefined}
    inputs={[refetch, projectId, type]}
    fetch={() => fetchData()}
>
    {
        (data) => <pre>{JSON.stringify(data)}</pre>
    }
</Request>;

const id = 1;
<Component id={id} />
```

The Request always be "Initial" status and never trigger the fetch while the value of `enable` property is `false`.
Its render will return the result of `renderDisable` function.

### Integration with redux saga

```jsx
function* fetchData(action) {
    const {payload: done, id} = action;
    yield fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
        .then(response => response.json())
        .then(done)
        .catch(done);
}

// The data should be injected to props by redux
const Component = (props) => <Request
    fetch={(done) => dispatch({type: 'fetch-data', payload: {id: 1, done}})}
>
    {
        () => <pre>{JSON.stringify(props.data)}</pre>
    }
</Request>;
```

## Customize

You can modify any presentation for each request status.

1. renderDisable: it will be invoked while `enable: false`.
2. renderPending: it will be invoked after `fetch` invoked.
3. renderLoading: it will be invoked after pending time over `showLoadingOverTime` (defaults to 1 second).
4. children: if fetch done successfully
5. renderFailed: if fetch failed

### Set default config for each Request container

```jsx
// my-request.jsx
import React from 'react';
import styled from 'styled-components';
import {RequestFactory} from 'react-request-container';

const FailedBG = styled.section`
    color: red;
    border: 1px dashed red;
    padding: 0px 20px;
    margin: 10px;
    overflow: scroll;
    width: 800px;
    width: 600px;
`;

const Failed = (error) => <FailedBG>
    <h2>Request Failed!</h2>
    <p>Error Message: {error.message}</p>
    <pre>Error Stack: {error.stack}</pre>
</FailedBG>;

const Request = RequestFactory.make({
    renderDisable: () => <div>[disabled]</div>,
    renderPending: () => <div>[pending]</div>,
    renderLoading: () => <div>[loading...]</div>,
    renderFailed: (err) => Failed(err),
    showLoadingOverTime: 2000,
});

export default Request;
```

```jsx
import Request from './my-request.jsx'

// The usages are same to origin Request usages
```

### Set config for special Request container

It will override the default config in `RequestFactory.make`;

```jsx
<Request
    renderLoading: () => <LoadingBG>[loading...]</LoadingBG>,
    renderFailed: (err) => Failed(err),
    showLoadingOverTime: 2000,
>
    {(data) => <div>{data}</div>}
</Request>
```

## API

### Request

Please see source code file.

### RequestFactory.make(props)

Please see source code file.

## Versioning

The versioning follows the rules of SemVer 2.0.0.

**Attentions**: anything may have **BREAKING CHANGES** at **ANY TIME** when major version is zero (0.y.z), which is for initial development and the public API should be considered unstable.

For more information on SemVer, please visit http://semver.org/.


## Copyright and License

Copyright (c) 2018 ADoyle. The project is licensed under the **Apache License Version 2.0**.

See the [LICENSE][] file for the specific language governing permissions and limitations under the License.

See the [NOTICE][] file distributed with this work for additional information regarding copyright ownership.


<!-- Links -->

[LICENSE]: ./LICENSE
[NOTICE]: ./NOTICE
