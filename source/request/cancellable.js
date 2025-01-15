import { Extensions } from '@shakerquiz/utilities'
import { useCallback, useEffect, useRef } from 'react'

/**
 * @template {{ fetch: any }} Contract
 *
 * @param {Contract} contract
 */
export let cancellable = contract => {
  /** @type {import('react').RefObject<AbortController>} */
  let reference = useRef(null)

  let onbefore = useCallback(() => {
    if (reference.current === null)
      reference.current = new AbortController()
  }, [])

  let onfulfilled = useCallback(contract => {
    reference.current = null

    return contract
  }, [])

  let onrejected = useCallback(reason => {
    reference.current = null

    throw reason
  }, [])

  useEffect(() => {
    if (Extensions.has(contract.fetch))
      Extensions.set(contract.fetch, {
        onbefore: Extensions
          .get(contract.fetch)
          .onbefore
          .add(onbefore),

        onfulfilled: Extensions
          .get(contract.fetch)
          .onfulfilled
          .add(onfulfilled),

        onrejected: Extensions
          .get(contract.fetch)
          .onfulfilled
          .add(onrejected),
      })

    return Extensions.set.bind(
      Extensions,
      contract.fetch,
      {
        onbefore: Extensions
          .get(contract.fetch)
          .onbefore
          .delete(onbefore),

        onfulfilled: Extensions
          .get(contract.fetch)
          .onfulfilled
          .delete(() => console.log('Phase.Loaded')),

        onrejected: Extensions
          .get(contract.fetch)
          .onfulfilled
          .delete(() => console.log('Phase.Failed')),
      },
    )
  }, [])

  return {
    ...contract,
    controller: reference.current,
  }
}
