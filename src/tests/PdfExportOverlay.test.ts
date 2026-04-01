import { mount } from '@vue/test-utils'
import PdfExportOverlay from '@/components/PdfExportOverlay.vue'

describe('PdfExportOverlay', () => {
  it('does not render the overlay card when visible=false', () => {
    const wrapper = mount(PdfExportOverlay, {
      props: { visible: false },
    })
    expect(wrapper.find('.bg-white').exists()).toBe(false)
  })

  it('renders the overlay card when visible=true', () => {
    const wrapper = mount(PdfExportOverlay, {
      props: { visible: true },
    })
    expect(wrapper.find('.bg-white').exists()).toBe(true)
  })

  it('shows the default message when no message prop is provided', () => {
    const wrapper = mount(PdfExportOverlay, {
      props: { visible: true },
    })
    expect(wrapper.text()).toContain('Generating your PDF report...')
  })

  it('shows custom message when message prop is provided', () => {
    const wrapper = mount(PdfExportOverlay, {
      props: { visible: true, message: 'Processing appendices...' },
    })
    expect(wrapper.text()).toContain('Processing appendices...')
  })

  it('contains the "do not close" warning when visible', () => {
    const wrapper = mount(PdfExportOverlay, {
      props: { visible: true },
    })
    expect(wrapper.text().toLowerCase()).toContain('do not close')
  })
})
