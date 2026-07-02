import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createURLStore } from '../src/index'

function setUrl(search: string): void {
    window.history.replaceState({}, '', `/${search ? `?${search}` : ''}`)
}

describe('createURLStore', () => {
    beforeEach(() => setUrl(''))

    it('initializes from defaults merged with URL', () => {
        setUrl('keyword=foo&page=3')
        const store = createURLStore({ keyword: '', page: 1, size: 20 })
        expect(store.getState()).toEqual({ keyword: 'foo', page: 3, size: 20 })
    })

    it('set mutates memory only; sync writes the URL', () => {
        const store = createURLStore({ keyword: '' })
        store.set({ keyword: 'bar' })
        expect(store.get('keyword')).toBe('bar')
        expect(window.location.search).toBe('') // 还没 sync
        store.sync()
        expect(window.location.search).toBe('?keyword=bar')
    })

    it('methods are destructurable, getState returns a fresh snapshot', () => {
        const { getState, set } = createURLStore({ keyword: '' })
        set({ keyword: 'x' })
        expect(getState()).toEqual({ keyword: 'x' })
    })

    it('decodes by declared type (number / boolean / string)', () => {
        setUrl('n=42&b=true&s=hello')
        const store = createURLStore({ n: 0, b: false, s: '' })
        expect(store.getState()).toEqual({ n: 42, b: true, s: 'hello' })
    })

    it('keeps long numeric strings (snowflake IDs) as strings — no precision loss', () => {
        setUrl('accountId=2069365971128094722')
        const store = createURLStore({ accountId: '' }) // 声明为 string
        expect(store.getState().accountId).toBe('2069365971128094722')
    })

    it('only picks fields declared in the schema', () => {
        setUrl('keyword=foo&unknown=bar')
        const store = createURLStore({ keyword: '' })
        expect(store.getState()).toEqual({ keyword: 'foo' })
    })

    it('supports array / multi-value params', () => {
        setUrl('tags=a&tags=b')
        const store = createURLStore({ tags: [] as string[] })
        expect(store.getState().tags).toEqual(['a', 'b'])
        store.set({ tags: ['x', 'y'] })
        store.sync()
        expect(window.location.search).toBe('?tags=x&tags=y')
    })

    it('sync drops empty / null / undefined values', () => {
        const store = createURLStore({ a: '', b: 'x' })
        store.sync()
        expect(window.location.search).toBe('?b=x')
    })

    it('reset restores defaults and writes the URL', () => {
        setUrl('keyword=foo')
        const store = createURLStore({ keyword: '' })
        store.set({ keyword: 'y' })
        store.reset()
        expect(store.getState()).toEqual({ keyword: '' })
        expect(window.location.search).toBe('')
    })

    it('default (immediate off): set does not write the URL', () => {
        const store = createURLStore({ keyword: '' })
        store.set({ keyword: 'x' })
        expect(window.location.search).toBe('')
    })

    it('immediate: writes the URL on every set', () => {
        const store = createURLStore({ keyword: '' }, { immediate: true })
        store.set({ keyword: 'x' })
        expect(window.location.search).toBe('?keyword=x')
    })

    it('subscribe: notifies on set / reset, stops after unsubscribe', () => {
        const store = createURLStore({ keyword: '' })
        const fn = vi.fn()
        const off = store.subscribe(fn)

        store.set({ keyword: 'a' })
        expect(fn).toHaveBeenLastCalledWith({ keyword: 'a' })

        store.reset()
        expect(fn).toHaveBeenLastCalledWith({ keyword: '' })

        off()
        store.set({ keyword: 'b' })
        expect(fn).toHaveBeenCalledTimes(2) // 取消订阅后不再触发
    })
})
