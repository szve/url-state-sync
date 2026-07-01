/**
 * url-state-sync — v3：schema 类型安全 + subscribe 通知的 URL 同步 store（框架无关、零依赖、直连 History API）。
 *
 * - v1：内存 state + 手动 sync + 解构友好
 * - v2：按 initialState 的字段类型解码（雪花ID 不丢精度）+ 数组/多值
 * - v3：subscribe —— state 变化（set / reset / 后退前进）时通知，UI 无需手动 refresh
 *
 * 后续：pluggable adapter(vue-router…)、Vue composables。
 */

export interface CreateURLStoreOptions {
    /** 是否自动监听 popstate（前进/后退），默认 true。关掉的话用户点后退，你的数据不会变 */
    listenPopState?: boolean
    /** 是否每次 set 后立即同步到 URL，默认 false（只改内存、需手动调 sync） */
    immediate?: boolean
}

export interface URLStore<S> {
    /** 取当前 state 的快照（函数式；解构后调用仍每次拿最新） */
    getState: () => S
    /** 读取单个字段 */
    get: <K extends keyof S>(key: K) => S[K]
    /** 合并写入若干字段（仅改内存，不写 URL；immediate 时自动 sync） */
    set: (partial: Partial<S>) => void
    /** 手动把当前 state 同步到 URL（replaceState，不新增历史） */
    sync: () => void
    /** 重置为初始值并写入 URL */
    reset: () => void
    /** 订阅 state 变化（set / reset / 后退前进都会触发），返回取消订阅函数 */
    subscribe: (listener: (state: S) => void) => () => void
}

/**
 * 按「默认值的类型」解码 URL 原始值（v2 类型安全的核心）：
 * - 数组 → 归一化为字符串数组
 * - number → Number()，NaN 回退默认值
 * - boolean → 'true' 判真
 * - string / 其他 → **保持字符串**（雪花ID、前导 0 都不丢失）
 */
function decodeByType(raw: string | string[] | null, def: unknown): unknown {
    if (raw === null || raw === undefined) return def
    if (Array.isArray(def)) return Array.isArray(raw) ? raw.map(String) : [String(raw)]
    const first = Array.isArray(raw) ? raw[0] ?? '' : raw
    if (typeof def === 'number') {
        const n = Number(first)
        return Number.isNaN(n) ? def : n
    }
    if (typeof def === 'boolean') return first === 'true'
    return String(first)
}

/**
 * 创建 URL 同步 store。initialState 既是默认值，也是**类型 schema**（决定每个字段怎么编解码）。
 * @param initialState 初始/默认值（同时定义字段类型）
 * @param options 配置项
 */
export function createURLStore<S extends Record<string, any>>(
    initialState: S = {} as S,
    options: CreateURLStoreOptions = {},
): URLStore<S> {
    let state = { ...initialState }
    const keys = Object.keys(initialState) as (keyof S & string)[]
    const listeners = new Set<(state: S) => void>()

    // 通知所有订阅者（传当前 state 快照）
    const notify = (): void => {
        const snapshot = { ...state }
        listeners.forEach(cb => cb(snapshot))
    }

    // 解析 URL → state（只取 schema 字段，按各自类型解码）
    const parseURL = (): Partial<S> => {
        const params = new URLSearchParams(window.location.search)
        const next: Record<string, any> = {}
        for (const key of keys) {
            if (!params.has(key)) continue
            const def = (initialState as Record<string, any>)[key]
            const raw = Array.isArray(def) ? params.getAll(key) : params.get(key)
            next[key] = decodeByType(raw, def)
        }
        return next as Partial<S>
    }

    // 序列化 state → URL（数组写多值；空串/null/undefined 不写；replaceState）
    const syncURL = (): void => {
        const params = new URLSearchParams()
        for (const key of keys) {
            const value = (state as Record<string, any>)[key]
            if (value === undefined || value === null || value === '') continue
            if (Array.isArray(value)) {
                value.filter(v => v !== '' && v !== null && v !== undefined).forEach(v => params.append(key, String(v)))
            } else {
                params.set(key, String(value))
            }
        }
        const search = params.toString()
        window.history.replaceState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}`)
    }

    // 更新数据（默认仅改内存 + 通知；immediate 时每次 set 后自动 sync）
    const setState = (partial: Partial<S>): void => {
        state = { ...state, ...partial }
        if (options.immediate) syncURL()
        notify()
    }

    // 初始化：默认值之上覆盖 URL 解析结果
    state = { ...initialState, ...parseURL() }

    // 监听浏览器后退/前进（可选）
    if (options.listenPopState !== false) {
        window.addEventListener('popstate', () => {
            state = { ...initialState, ...parseURL() }
            notify()
        })
    }

    return {
        getState: () => ({ ...state }),
        get: key => state[key],
        set: setState,
        sync: () => syncURL(),
        reset: () => {
            state = { ...initialState }
            syncURL()
            notify()
        },
        subscribe: (listener) => {
            listeners.add(listener)
            return () => {
                listeners.delete(listener)
            }
        },
    }
}
