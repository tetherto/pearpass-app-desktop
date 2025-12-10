# pear-apps-lib-ui-react-hooks

A collection of React hooks for Pearpass applications that simplify form handling, state management, and UI interactions.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage Examples](#usage-examples)
- [Dependencies](#dependencies)
- [Related Projects](#related-projects)

## Features

- **useForm**: Form state management with validation, array fields, and nested values
- **useDebounce**: Delay state updates until after a specified delay
- **useThrottle**: Limit the frequency of state updates
- **useCountDown**: Create countdown timers with formatting

## Installation

```bash
npm install pear-apps-lib-ui-react-hooks
```

## Usage Examples

### useForm

```jsx
import { useForm } from 'pear-apps-lib-ui-react-hooks';

const MyForm = () => {
    const validate = (values) => {
        const errors = {};
        if (!values.email) errors.email = 'Email is required';
        return errors;
    };

    const { values, errors, register, handleSubmit } = useForm({
        initialValues: { email: '', password: '' },
        validate,
    });

    const onSubmit = (formValues) => {
        console.log('Form submitted:', formValues);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')} />
            {errors.email && <span>{errors.email}</span>}
            <button type="submit">Submit</button>
        </form>
    );
};
```

### useDebounce

```jsx
import { useDebounce } from 'pear-apps-lib-ui-react-hooks';

const SearchComponent = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { debouncedValue } = useDebounce({ value: searchTerm, delay: 500 });

    useEffect(() => {
        // This will only run 500ms after the last change to searchTerm
        fetchSearchResults(debouncedValue);
    }, [debouncedValue]);

    return (
        <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
        />
    );
};
```

### useThrottle

```jsx
import { useThrottle } from 'pear-apps-lib-ui-react-hooks';

const InfiniteScroll = () => {
    const handleScroll = () => {
        // Load more content on scroll
    };

    const { throttle } = useThrottle({ interval: 300 });

    useEffect(() => {
        const throttledHandler = () => throttle(handleScroll);
        window.addEventListener('scroll', throttledHandler);
        return () => window.removeEventListener('scroll', throttledHandler);
    }, []);

    return <div>Scroll content...</div>;
};
```

### useCountDown

```jsx
import { useCountDown } from 'pear-apps-lib-ui-react-hooks';

const Timer = () => {
    const timeRemaining = useCountDown({
        initialSeconds: 60,
        onFinish: () => alert('Time is up!'),
    });

    return <div>Time remaining: {timeRemaining}</div>;
};
```

## Dependencies

- React 18.3.1 or higher

## Related Projects

- [pearpass-app-mobile](https://github.com/tetherto/pearpass-app-mobile) - A mobile app for PearPass, a password manager
- [pearpass-app-desktop](https://github.com/tetherto/pearpass-app-desktop) - A desktop app for PearPass, a password
- [tether-dev-docs](https://github.com/tetherto/tether-dev-docs) - Documentations and guides for developers

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for details.