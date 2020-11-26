# managed-misses-cache
Memory cache with bound miss functions to allow for cleaner data layer abstraction
## Installation
    npm install managed-misses-cache

## Example
```typescript
import Cache from 'managed-misses-cache'

Cache.bindMissHandler('name', 15000, async function(){
    return 'sam'
})

let name = Cache.get('name')
```

## Usage

### Generic Miss Handlers
The key missed is passed to the miss handler allowing you to better generalize their logic.
```typescript
async function getData(key: string): Promise<string> {

    switch (key) {
        case 'name':
            return 'sam'

        case 'job':
            return 'driver'
    }

    return ''
}

await Cache.bindMissHandler('name', 15000, getData)
await Cache.bindMissHandler('job', 15000, getData)

setTimeout(async function(){
    let name = await Cache.get('name')
    let job = await Cache.get('job')

    assert.strictEqual(name, 'sam')
    assert.strictEqual(job, 'driver')
}, 200)
```