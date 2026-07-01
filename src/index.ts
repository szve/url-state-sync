/**
 * url-state-sync — 第一版：极简的 URL 同步 store（框架无关、零依赖、直连 History API）。
 *
 * 设计目标：内存持有 state + 手动触发写 URL + 支持解构。
 * 后续版本再逐步加回：schema 类型安全（避免长数字/雪花ID 被误转）、subscribe 通知、数组多值、adapter（vue-router 等）。
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
    /** 合并写入若干字段（仅改内存，不写 URL；需手动 sync） */
    set: (partial: Partial<S>) => void
    /** 手动把当前 state 同步到 URL（replaceState，不新增历史） */
    sync: () => void
    /** 重置为初始值并写入 URL */
    reset: () => void
}

/**
 * 创建 URL 同步 store。
 * @param initialState 初始/默认值
 * @param options 配置项
 */
export function createURLStore<S extends Record<string, any>>(
    initialState: S = {} as S,
    options: CreateURLStoreOptions = {},
): URLStore<S> {
    // 1. 内部状态
    let state = { ...initialState }

    // 2. 解析 URL 参数到 state（按值简单推断类型：数字 / 布尔 / 字符串）
    const parseURL = (): Partial<S> => {
        const params = new URLSearchParams(window.location.search)
        const next: Record<string, any> = {}
        params.forEach((value, key) => {
            if (value.trim() !== '' && !Number.isNaN(Number(value))) {
                next[key] = Number(value) // 尝试转数字
            } else if (value === 'true') {
                next[key] = true
            } else if (value === 'false') {
                next[key] = false
            } else {
                next[key] = value // 默认字符串
            }
        })
        return next as Partial<S>
    }

    // 3. 序列化 state 到 URL（replaceState：改地址、不刷新、不新增历史）
    const syncURL = (): void => {
        const params = new URLSearchParams()
        Object.entries(state).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value))
            }
        })
        const search = params.toString()
        window.history.replaceState({}, '', `${window.location.pathname}${search ? `?${search}` : ''}`)
    }

    // 4. 更新数据（默认仅改内存、不立即写 URL；immediate 时每次 set 后自动 sync）
    const setState = (partial: Partial<S>): void => {
        state = { ...state, ...partial }
        if (options.immediate) syncURL()
    }

    // 5. 初始化：读一次 URL（在默认值之上覆盖，保留 URL 里没带的字段的默认值）
    state = { ...initialState, ...parseURL() }

    // 6. 监听浏览器后退/前进（可选）
    if (options.listenPopState !== false) {
        window.addEventListener('popstate', () => {
            state = { ...initialState, ...parseURL() }
        })
    }

    // 7. 返回 API（支持解构）
    return {
        getState: () => ({ ...state }),
        get: key => state[key],
        set: setState,
        sync: () => syncURL(),
        reset: () => {
            state = { ...initialState }
            syncURL()
        },
    }
}
