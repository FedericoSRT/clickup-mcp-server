
# v0.6.2 Release Notes (2025-03-27)

## 🚀 New Features & Improvements

- Added comprehensive tag support:
  - Tools for managing tags at space level (get, create, update, delete)
  - Add and remove tags from tasks with `add_tag_to_task` and `remove_tag_from_task`
  - Support for tags when creating and updating tasks

- Added natural language color processing for tags:
  - Create tags with simple color names (e.g., "blue", "red", "yellow")
  - Support for color variations (e.g., "dark blue", "light green")
  - Automatic generation of contrasting foreground colors
  - Color commands in both tag creation and updates

- Added `get_workspace_tasks` tool for workspace-wide task retrieval:
  - Filter tasks by tags, lists, spaces, folders, statuses, and more
  - Implements an Automatica Adaptive Response Format with two detail levels:
    - `summary`: Lightweight response with essential task info
    - `detailed`: Complete task information with all fields (default)
  - Automatically changes detail level based on response size (50,000 token threshold)
  - Optimized for efficiently handling large datasets

## 📦 Dependencies

- No dependency changes in this release

## 🔄 Repository Updates

- Updated documentation with tag management examples
- Added API reference for the new workspace tasks filtering tool
- Improved main README with feature descriptions
- Enhanced changelog to document the new capabilities
