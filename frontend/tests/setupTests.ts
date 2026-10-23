require('@testing-library/jest-dom/jest-globals');

URL.createObjectURL = jest.fn(() => 'mock-object-url');
URL.revokeObjectURL = jest.fn();