# @coool/route-node

Utilities for easy route node definitions.

## Install

```shell script
$ npm i --save @coool/route-node
```

## Usage 

### Define routes

```typescript
export const RouteLocations = {
  Home: new RouteNode('', {
    queryParams: {
      Stay: 'stay',
    },
  }),

  Dashboard: new RouteNode('dashboard', {
    Items: new RouteNode('items/:itemId', undefined, {
      params: {
        'itemId': 'itemId',
      },
    }),
  }),
};
```

### Use routes

```typescript
@Get(RouteLocations.Dashboard.children.Items)
public async getItems(
  @Param(RouteLocations.Dashboard.children.Items.params.itemId) itemId: string,
) {
  // ...
}
```