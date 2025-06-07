# Playground Layout Components

A standardized set of components for creating interactive scientific playgrounds with a consistent user experience.

## Components Overview

### PlaygroundLayout
The main layout component that creates a full-height, multi-section playground with automatic scroll behavior, settings panel integration, and section navigation.

### PlaygroundViewer
A wrapper for the main visualization content with optional header, title, and controls.

### PlaygroundSettings
A standardized settings panel with organized sections for playground parameters.

## Basic Usage

```tsx
import PlaygroundLayout from '@/components/PlaygroundLayout';
import PlaygroundViewer from '@/components/PlaygroundViewer';
import PlaygroundSettings from '@/components/PlaygroundSettings';

export default function MyPlayground() {
    const [parameter1, setParameter1] = useState(defaultValue);
    const [parameter2, setParameter2] = useState(defaultValue);
    
    const sections = [
        {
            id: 'intro',
            type: 'intro',
            content: (
                <div className="mt-12">
                    <p className="text-xl text-gray-300 mb-4">
                        Brief description of what your playground does
                    </p>
                    <p className="text-gray-400">
                        More detailed explanation or context
                    </p>
                </div>
            ),
        },
        {
            id: 'visualization',
            type: 'canvas',
            content: (
                <PlaygroundViewer
                    title="My Playground"
                    subtitle="Interactive exploration of some concept"
                >
                    {/* Your main visualization component here */}
                    <MyVisualization 
                        parameter1={parameter1}
                        parameter2={parameter2}
                    />
                </PlaygroundViewer>
            ),
        },
        {
            id: 'about',
            type: 'outro',
            content: (
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-8">About This Playground</h2>
                    <div className="text-gray-300 space-y-4 max-w-2xl mx-auto text-left">
                        <p>Detailed explanation of the concept...</p>
                        <p>Mathematical background...</p>
                        <p>Applications and implications...</p>
                    </div>
                </div>
            ),
        },
    ];

    const settings = (
        <PlaygroundSettings
            sections={[
                {
                    title: 'Basic Parameters',
                    content: (
                        <>
                            <Input
                                value={parameter1}
                                onChange={setParameter1}
                                label="Parameter 1"
                                compact={true}
                                type="number"
                            />
                            <Input
                                value={parameter2}
                                onChange={setParameter2}
                                label="Parameter 2"
                                compact={true}
                                type="number"
                            />
                        </>
                    ),
                },
                {
                    title: 'Advanced Settings',
                    content: (
                        // More complex controls...
                    ),
                },
            ]}
        />
    );

    return (
        <PlaygroundLayout
            title="My Playground"
            subtitle="Brief tagline"
            sections={sections}
            settings={settings}
        />
    );
}
```

## Section Types

### Intro Section (`type: 'intro'`)
- Full height section with centered content
- Displays Piatra Institute logo
- Shows playground title and subtitle
- Includes custom content below the title
- Scroll indicator at bottom

### Canvas Section (`type: 'canvas'`)
- Full height section for main playground content
- Automatically shows settings button on the left when settings are provided
- Black background by default
- Main interaction area

### Outro Section (`type: 'outro'`)
- Full height section for additional information
- Typically used for detailed explanations, mathematical background, or about information
- Black background with centered content

## Features

### Scroll Navigation
- Automatic scroll snapping between sections
- Section indicators in bottom-right corner
- Clickable navigation dots

### Settings Panel
- Left-side settings button appears in canvas sections
- Full-screen overlay on mobile, sidebar on desktop
- Escape key to close
- Organized into collapsible sections

### Responsive Design
- Mobile-first approach
- Adapts to different screen sizes
- Touch-friendly interface

## Complex Playground Example

For playgrounds with complex visualizations (like Three.js, D3, or Canvas-based), you can still use the standardized layout while maintaining your existing visualization components:

```tsx
// Keep your existing complex Viewer component
import MyComplexViewer from './components/Viewer';
import MyComplexSettings from './components/Settings';

export default function ComplexPlayground() {
    // Your existing state management...
    
    const sections = [
        {
            id: 'intro',
            type: 'intro',
            // ... intro content
        },
        {
            id: 'visualization',
            type: 'canvas',
            content: (
                <div className="absolute inset-0">
                    {/* Your existing full-screen visualization */}
                    <MyComplexViewer {...viewerProps} />
                    
                    {/* Optional: Keep existing header overlay */}
                    <div className="absolute top-0 left-0 z-10 p-6 pointer-events-none">
                        <Header />
                        <Title text="Your Playground Title" />
                    </div>
                </div>
            ),
        },
        {
            id: 'about',
            type: 'outro',
            // ... outro content
        },
    ];

    // You can still use your existing complex settings component
    const settings = <MyComplexSettings {...settingsProps} />;

    return (
        <PlaygroundLayout
            title="Complex Playground"
            sections={sections}
            settings={settings}
        />
    );
}
```

## Migration Guide

To migrate existing playgrounds:

1. **Simple playgrounds**: Use the full standardized components as shown in the basic example
2. **Complex playgrounds**: Keep your existing Viewer and Settings components, but wrap them in the new layout structure
3. **Update imports**: Add the new playground layout components
4. **Preserve functionality**: All existing functionality should work within the new structure

## Benefits

- **Consistent UX**: All playgrounds have the same navigation and interaction patterns
- **Professional presentation**: Standardized intro/outro sections with logo and descriptions
- **Mobile-friendly**: Responsive design that works on all devices
- **Accessibility**: Proper keyboard navigation and screen reader support
- **Easy maintenance**: Centralized layout logic reduces code duplication