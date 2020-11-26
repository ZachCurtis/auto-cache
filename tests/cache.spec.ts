import Cache from '../index'
import assert = require('assert')

describe('cache', function () {

    beforeEach(async function () {
        await Cache.unbindMissHandler('name')
        await Cache.unbindMissHandler('job')
    })

    it('should save and load a value', async function () {
        await Cache.bindMissHandler('name', 15000, async function () {
            return 'sam'
        })

        setTimeout(async () => {
            let name = await Cache.get('name')
            assert.strictEqual(name, 'sam')
        })
    })

    it('should get and concat an array of arrays', async function () {
        async function getData(key: string): Promise<Array<any>> {

            switch (key) {
                case 'spots':
                    return ['ledge gap', 'Bank']

                case 'stairs':
                    return ['5 stair' , '12 stair']
            }
            return ['']
        }

        await Cache.bindMissHandler('spots', 15000, getData)
        await Cache.bindMissHandler('stairs', 15000, getData)

        setTimeout(async function() {
            let allSpots = await Cache.getConcat(['spots', 'stairs'])
            assert.deepStrictEqual(allSpots, ['ledge gap', 'Bank', '5 stair', '12 stair'])
        }, 500)
    })
    
    it('shouldnt get and concat an array with a string', async function () {
        async function getData(key: string): Promise<Array<any>> {

            switch (key) {
                case 'spots':
                    return 'ledge gap'

                case 'stairs':
                    return ['5 stair' , '12 stair']
            }
            return ['']
        }

        await Cache.bindMissHandler('spots', 15000, getData)
        await Cache.bindMissHandler('stairs', 15000, getData)

        setTimeout(async function() {
            assert.throws(await Cache.getConcat(['spots', 'stairs']))
        }, 500)
    })


    it('should use a generic miss handler', async function () {
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

        setTimeout(async function () {
            let name = await Cache.get('name')
            let job = await Cache.get('job')

            assert.strictEqual(name, 'sam')
            assert.strictEqual(job, 'driver')
        }, 200)

    })

    it('should delete the data after it expires', async function () {
        let lastSaved = 0

        await Cache.bindMissHandler('name', 2000, async function (key: string) {
            lastSaved = Date.now()

            return 'sam'
        })

        let lastSaved0 = lastSaved
        await Cache.get('name')
        let lastSaved1 = Date.now()

        assert.strictEqual((lastSaved1 - lastSaved0) > 2000, true)

        setTimeout(async () => {
            let lastSavedCache = lastSaved

            await Cache.get('name')

            assert.strictEqual((lastSaved - lastSavedCache) > 2000, true)
        }, 3000);
    })

    it('should allow for manual misses', async function() {
        let name = 'sam'
        await Cache.bindMissHandler('name', 15000, async function () {
            return name
        })

        assert.strictEqual(await Cache.get('name'), 'sam')
       
        name = 'joe'
        await Cache.miss('name')

        setTimeout(async () => {
            assert.strictEqual(await Cache.get('name'), 'joe')
        }, 2000)
    })

    it('should unbind miss handlers', async function () {
        await Cache.bindMissHandler('name', 200, async function (key: string) {
            return 'sam'
        })

        await Cache.unbindMissHandler('name')
        
        await Cache.bindMissHandler('name', 2000, async function (key: string) {
            return 'john'
        })
    
        await Cache.miss('name')

        setTimeout(async () => {
            
            assert.strictEqual(await Cache.get('name'), 'john')
        }, 1500);
    })
})
